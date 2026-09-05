export interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<TurnstileVerifyResponse> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    if (!response.ok) {
      console.error('Turnstile verification request failed:', response.statusText);
      return { success: false, error_codes: ['verification_request_failed'] };
    }

    const data = (await response.json()) as TurnstileVerifyResponse;
    return data;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, error_codes: ['verification_error'] };
  }
}
