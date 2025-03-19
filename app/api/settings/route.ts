import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Convert services, caseStudies, and specialOffers to arrays if they're strings
    const formattedData = {
      ...data,
      services: data.services.split('\n').filter(Boolean),
      caseStudies: data.caseStudies.split('\n').filter(Boolean),
      specialOffers: data.specialOffers.split('\n').filter(Boolean),
    };

    const settings = await prisma.companySettings.findFirst();

    if (settings) {
      await prisma.companySettings.update({
        where: { id: settings.id },
        data: { ...formattedData, updatedAt: new Date() }
      });
    } else {
      await prisma.companySettings.create({
        data: formattedData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}