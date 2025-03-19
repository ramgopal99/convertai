import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const emailHistory = await prisma.emailHistory.findMany({
      include: {
        lead: {
          select: {
            name: true,
            company: true,
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    return NextResponse.json(emailHistory);
  } catch (error) {
    console.error('Failed to fetch email history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email history' },
      { status: 500 }
    );
  }
}