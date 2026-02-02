import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendOTPViaSMS } from '@/lib/sms';

const prisma = new PrismaClient();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { phone, code, action } = await req.json();

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

    // ============ SEND OTP ============
    if (action === 'send') {
      // Check if user exists with this phone
      let user = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });

      // If not exists, create farmer user
      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: cleanPhone,
            email: `farmer-${cleanPhone}@occamy-field-ops.local`, // Placeholder email
            name: `Farmer ${cleanPhone}`,
            username: `farmer_${cleanPhone}`,
            role: 'FARMER',
          },
        });
      }

      // Delete any old OTPs for this phone
      await prisma.oTP.deleteMany({
        where: { phone: cleanPhone },
      });

      // Generate and store new OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await prisma.oTP.create({
        data: {
          phone: cleanPhone,
          code: otp,
          expiresAt,
          attempts: 0,
        },
      });

      // Send OTP via Twilio SMS
      try {
        await sendOTPViaSMS(cleanPhone, otp);
      } catch (smsError) {
        console.error('Failed to send SMS:', smsError);
        // In production, you might want to throw the error
        // For now, we'll let it proceed but log the failure
        if (process.env.NODE_ENV === 'production') {
          throw smsError;
        }
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        // Remove in production - only for dev
        dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      });
    }

    // ============ VERIFY OTP ============
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json(
          { error: 'OTP code required' },
          { status: 400 }
        );
      }

      // Find active OTP
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          phone: cleanPhone,
          verified: false,
          expiresAt: { gt: new Date() }, // Not expired
        },
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: 'OTP expired or not found. Request a new one.' },
          { status: 400 }
        );
      }

      // Check attempts
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        await prisma.oTP.delete({ where: { id: otpRecord.id } });
        return NextResponse.json(
          { error: 'Too many attempts. Request a new OTP.' },
          { status: 429 }
        );
      }

      // Verify OTP
      if (otpRecord.code === code) {
        // Find user first
        const user = await prisma.user.findFirst({
          where: { phone: cleanPhone },
        });

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Mark OTP as verified and store userId
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { verified: true, userId: user.id },
        });

        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully',
          userId: user.id,
          email: user.email,
        });
      } else {
        // Increment attempts
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });

        const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
        return NextResponse.json(
          {
            error: `Invalid OTP. ${remaining} attempts remaining.`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
