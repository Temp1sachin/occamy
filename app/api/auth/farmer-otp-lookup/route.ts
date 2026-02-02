import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Find the most recent verified OTP for this phone (within last 60 seconds)
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    
    console.log('Lookup: Searching for verified OTP', { phone: cleanPhone, since: sixtySecondsAgo });
    
    const verifiedOTP = await prisma.oTP.findFirst({
      where: {
        phone: cleanPhone,
        verified: true,
        createdAt: { gte: sixtySecondsAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Lookup: Found OTP record:', { 
      found: !!verifiedOTP, 
      verified: verifiedOTP?.verified,
      userId: verifiedOTP?.userId,
      createdAt: verifiedOTP?.createdAt
    });

    if (!verifiedOTP || !verifiedOTP.userId) {
      console.log('Lookup: No verified OTP or userId missing');
      return NextResponse.json(
        { error: 'No recent verified OTP found' },
        { status: 404 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: verifiedOTP.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Lookup: Returning user data:', { userId: user.id, email: user.email });
    
    // Set a temporary auth cookie for the farmer
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    
    // Set a secure httpOnly cookie that expires in 24 hours
    response.cookies.set({
      name: 'farmer-auth',
      value: verifiedOTP.id, // Use OTP ID as token
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('OTP Lookup Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
