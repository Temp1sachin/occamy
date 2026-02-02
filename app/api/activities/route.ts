import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query: any = {
      include: {
        user: { select: { name: true, id: true, role: true } },
        meeting: true,
        sale: true,
        distribution: true,
      },
      orderBy: { timestamp: 'desc' },
    };

    // Officers can only see their own activities
    if ((session.user as any).role === 'OFFICER') {
      query.where = { userId: (session.user as any).id };
    }

    const activities = await prisma.activityLog.findMany(query);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const activity = await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id as string,
        type: data.type,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(),
      },
      include: {
        user: { select: { name: true, id: true, role: true } },
      },
    });

    // Create related details based on type
    if (data.type === 'MEETING' && data.meeting) {
      await prisma.meetingDetails.create({
        data: {
          logId: activity.id,
          attendeeName: data.meeting.attendeeName,
          category: data.meeting.category,
          contactPhone: data.meeting.contactPhone || null,
          contactEmail: data.meeting.contactEmail || null,
          businessPotential: data.meeting.businessPotential || null,
          duration: data.meeting.duration,
          notes: data.meeting.notes,
          isGroupMeeting: data.meeting.isGroupMeeting || false,
          groupSize: data.meeting.groupSize || null,
          meetingType: data.meeting.meetingType || null,
        },
      });
    } else if (data.type === 'SALES' && data.sale) {
      await prisma.saleDetails.create({
        data: {
          logId: activity.id,
          productName: data.sale.productName,
          quantity: data.sale.quantity,
          unit: data.sale.unit,
          amount: data.sale.amount,
          buyerName: data.sale.buyerName,
          saleMode: data.sale.saleMode || 'DIRECT',
          isRepeatOrder: data.sale.isRepeatOrder || false,
          notes: data.sale.notes,
        },
      });
    } else if (data.type === 'DISTRIBUTION' && data.distribution) {
      await prisma.distributionDetails.create({
        data: {
          logId: activity.id,
          productName: data.distribution.productName,
          quantity: data.distribution.quantity,
          unit: data.distribution.unit,
          distributedTo: data.distribution.distributedTo,
          notes: data.distribution.notes,
        },
      });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
