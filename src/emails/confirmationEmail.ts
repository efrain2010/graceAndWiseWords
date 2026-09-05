import { getDictionary } from '../i18n/utils';

interface ConfirmationEmailParams {
  name: string;
  email: string;
  locale: 'en' | 'es' | 'gl';
  fromAddress: string;
  businessName: string;
}

export function buildConfirmationEmail(params: ConfirmationEmailParams) {
  const dict = getDictionary(params.locale);
  const emailDict = dict.emails.confirmation;

  const subject = emailDict.subject;
  const greeting = emailDict.greeting.replace('{name}', params.name);

  const text = `${greeting}

${emailDict.body}

${emailDict.followUp}

${emailDict.closing}
${emailDict.signature}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Work Sans', sans-serif; line-height: 1.6; color: #2c2016; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #241a13; color: #f4ead9; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f4ead9; }
    .footer { text-align: center; color: #8a7a63; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-family: 'EB Garamond', serif; font-size: 24px;">${params.businessName}</h1>
    </div>
    <div class="content">
      <p>${greeting}</p>
      <p>${emailDict.body}</p>
      <p>${emailDict.followUp}</p>
      <p>${emailDict.closing}<br>${emailDict.signature}</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2026 ${params.businessName}</p>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
