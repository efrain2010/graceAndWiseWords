import type { APIRoute } from 'astro';
import { validateForm } from '../../lib/validate';
import { verifyTurnstileToken } from '../../lib/turnstileVerify';
import { buildConfirmationEmail } from '../../emails/confirmationEmail';
import { buildNotificationEmail } from '../../emails/notificationEmail';

export const prerender = false;

interface ContactRequestBody {
  name: string;
  gender?: string;
  age: string;
  email: string;
  locale: 'en' | 'es' | 'gl';
  turnstileToken: string;
}

export const POST: APIRoute = async (context) => {
  try {
    const data = (await context.request.json()) as ContactRequestBody;

    // Validate form data
    const validationErrors = validateForm(data);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Validation failed', errors: validationErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify Turnstile token
    const turnstileSecret = context.locals.runtime?.env?.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Verification configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const remoteIp = context.request.headers.get('CF-Connecting-IP') || undefined;
    const turnstileVerification = await verifyTurnstileToken(
      data.turnstileToken,
      turnstileSecret,
      remoteIp
    );

    if (!turnstileVerification.success) {
      console.warn('Turnstile verification failed:', turnstileVerification.error_codes);
      return new Response(
        JSON.stringify({ success: false, error: 'Verification failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get email config
    const fromAddress = context.locals.runtime?.env?.CONTACT_FROM_ADDRESS || 'hello@gracewisewords.com';
    const ownerAddress = context.locals.runtime?.env?.OWNER_NOTIFICATION_ADDRESS || 'owner@gracewisewords.com';
    const businessName = context.locals.runtime?.env?.BUSINESS_NAME || 'Grace & Wise Words';
    const emailBinding = context.locals.runtime?.env?.EMAIL;

    if (!emailBinding) {
      console.error('EMAIL binding not configured');
      // Still return success to avoid exposing binding issues to the user
      return new Response(
        JSON.stringify({ success: true, warning: 'Email configuration pending' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build and send confirmation email (in user's locale)
    const confirmationEmail = buildConfirmationEmail({
      name: data.name,
      email: data.email,
      locale: data.locale,
      fromAddress,
      businessName,
    });

    try {
      await emailBinding.send({
        from: { email: fromAddress, name: businessName },
        to: data.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      });
      console.log(`Confirmation email sent to ${data.email}`);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't fail the whole request if confirmation email fails
    }

    // Build and send notification email (to owner, always in English)
    const notificationEmail = buildNotificationEmail({
      name: data.name,
      gender: data.gender,
      age: data.age,
      email: data.email,
      locale: data.locale,
      fromAddress,
      businessName,
    });

    try {
      await emailBinding.send({
        from: { email: fromAddress, name: businessName },
        to: ownerAddress,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
        text: notificationEmail.text,
      });
      console.log(`Notification email sent to ${ownerAddress}`);
    } catch (error) {
      console.error('Error sending notification email:', error);
      // Still return success - the important thing is we received the submission
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred processing your submission' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
