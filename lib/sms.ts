import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send OTP via SMS to a phone number
 * @param toPhone - Recipient phone number (10 digits, e.g., "9876543210")
 * @param otp - 6-digit OTP code
 * @returns Promise with SMS send result
 */
export async function sendOTPViaSMS(toPhone: string, otp: string): Promise<void> {
  // Validate environment variables
  if (!accountSid || !authToken || !fromNumber) {
    if (process.env.NODE_ENV === 'development') {
      // Fallback to console logging in dev mode if Twilio not configured
      console.log(`[DEV] OTP for ${toPhone}: ${otp}`);
      return;
    }
    throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
  }

  try {
    // Format phone number to international format (+91 for India, adjust as needed)
    const countryCode = process.env.PHONE_COUNTRY_CODE || '+91';
    const fullPhoneNumber = `${countryCode}${toPhone}`;

    const message = await client.messages.create({
      body: `Your Occamy verification code: ${otp}\n\nValid for 5 minutes. Do not share this code.`,
      from: fromNumber,
      to: fullPhoneNumber,
    });

    console.log(`[SMS] OTP sent to ${fullPhoneNumber}. Message SID: ${message.sid}`);
  } catch (error) {
    console.error('[SMS ERROR]', error);
    throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
