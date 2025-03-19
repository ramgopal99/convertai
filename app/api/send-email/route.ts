import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { OpenAI } from "openai";
import { PrismaClient } from '@prisma/client';
import { CronJob } from 'cron';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { parseISO } from 'date-fns';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

async function generateEmailContent(conversations: { message: string; response: string }[]) {
  const conversationHistory = conversations
    .map(conv => `User: ${conv.message}\nAI: ${conv.response}`)
    .join('\n');

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "Generate a personalized daily email update based on the user's conversation history." 
      },
      {
        role: "user",
        content: `Here are the recent conversations:\n${conversationHistory}\nGenerate a friendly email update.`
      }
    ],
  });

  return response.choices[0].message?.content || "Default Email Content";
}

async function sendEmail(email: string, conversations: { message: string; response: string }[], leadId?: string) {
  const content = await generateEmailContent(conversations);

  await transporter.sendMail({
    from: `"Seagate Tech" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your Daily Conversation Update",
    text: content,
  });

  // Save email history
  if (leadId) {
    await prisma.emailHistory.create({
      data: {
        email,
        content,
        leadId,
      }
    });
  }

  return { message: "Email sent!" };
}

export async function POST(req: NextRequest) {
  const { email, scheduleTime, frequency } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const lead = await prisma.lead.findFirst({
    where: { email },
    include: { conversations: true }
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Create or update email schedule
  if (scheduleTime) {
    // First try to find existing schedule
    const existingSchedule = await prisma.emailSchedule.findFirst({
      where: { leadId: lead.id }
    });

    if (existingSchedule) {
      // Update existing schedule
      const updatedSchedule = await prisma.emailSchedule.update({
        where: { id: existingSchedule.id },
        data: {
          time: scheduleTime,
          frequency: frequency || 'daily',
          enabled: true,
        },
      });
      return NextResponse.json({ 
        message: `Email schedule updated for ${scheduleTime} ${frequency || 'daily'}`,
        schedule: updatedSchedule
      });
    } else {
      // Create new schedule
      const newSchedule = await prisma.emailSchedule.create({
        data: {
          leadId: lead.id,
          time: scheduleTime,
          frequency: frequency || 'daily',
          enabled: true,
        },
      });
      return NextResponse.json({ 
        message: `Email scheduled for ${scheduleTime} ${frequency || 'daily'}`,
        schedule: newSchedule
      });
    }
  }

  // Immediate send if no schedule
  await sendEmail(email, lead.conversations, lead.id);
  return NextResponse.json({ message: "Email sent successfully!" });
}

// Get email schedules
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  if (!leadId) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  const schedules = await prisma.emailSchedule.findMany({
    where: { leadId },
    include: { lead: true },
  });

  return NextResponse.json(schedules);
}

// Update email schedule
export async function PATCH(req: NextRequest) {
  const { scheduleId, enabled, time, frequency } = await req.json();

  if (!scheduleId) {
    return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
  }

  const schedule = await prisma.emailSchedule.update({
    where: { id: scheduleId },
    data: {
      enabled: enabled !== undefined ? enabled : undefined,
      time: time || undefined,
      frequency: frequency || undefined,
    },
  });

  return NextResponse.json(schedule);
}

// Initialize cron job to check schedules
const emailSchedulerJob = new CronJob('*/4 * * * *', async () => { // Run every 4 minutes
  try {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    console.log(`Checking schedules at ${currentTime}`);
    
    // Get all active schedules
    const activeSchedules = await prisma.emailSchedule.findMany({
      where: { 
        enabled: true,
      },
      include: {
        lead: {
          include: {
            conversations: true
          }
        }
      }
    });

    console.log(`Found ${activeSchedules.length} active schedules`);

    // Process each schedule
    for (const schedule of activeSchedules) {
      try {
        const scheduleTime = parseISO(`${format(now, 'yyyy-MM-dd')}T${schedule.time}`);
        const timeDiff = Math.abs(now.getTime() - scheduleTime.getTime());
        
        // Check if current time is within 4 minutes of scheduled time
        if (timeDiff > 4 * 60 * 1000) {
          console.log(`Not time yet for ${schedule.lead.email} (scheduled: ${schedule.time})`);
          continue;
        }

        const { lead } = schedule;
        if (!lead.email || !lead.conversations.length) {
          console.log(`Skipping ${lead.id}: No email or conversations`);
          continue;
        }

        // Check if email was already sent today
        const lastEmail = await prisma.emailHistory.findFirst({
          where: {
            leadId: lead.id,
            sentAt: {
              gte: startOfDay(now),
              lte: endOfDay(now)
            }
          }
        });

        if (lastEmail) {
          console.log(`Already sent email today to ${lead.email}`);
          continue;
        }

        // Send email based on frequency
        const shouldSend = shouldSendEmail(schedule.frequency, schedule.lastSent);
        console.log(`Should send email to ${lead.email}? ${shouldSend}`);

        if (shouldSend) {
          console.log(`Sending email to ${lead.email}`);
          await sendEmail(lead.email, lead.conversations, lead.id);
          
          // Update last sent time
          await prisma.emailSchedule.update({
            where: { id: schedule.id },
            data: { lastSent: now }
          });
          console.log(`Successfully sent email to ${lead.email}`);
          
          // Add delay between emails
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to process schedule for lead:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Email scheduler error:', error);
  }
});

function shouldSendEmail(frequency: string, lastSent: Date | null): boolean {
  if (!lastSent) return true;
  
  const now = new Date();
  const lastSentDate = new Date(lastSent);
  
  switch (frequency) {
    case 'daily':
      return !isWithinInterval(lastSentDate, {
        start: startOfDay(now),
        end: endOfDay(now)
      });
    case 'weekly':
      return now.getTime() - lastSentDate.getTime() >= 7 * 24 * 60 * 60 * 1000;
    case 'monthly':
      return now.getMonth() !== lastSentDate.getMonth() || 
             now.getFullYear() !== lastSentDate.getFullYear();
    default:
      return true;
  }
}

// Start the cron job
emailSchedulerJob.start();
