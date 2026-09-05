import { getDictionary } from '../i18n/utils';

interface NotificationEmailParams {
  name: string;
  gender?: string;
  age: string;
  email: string;
  locale: 'en' | 'es' | 'gl';
  fromAddress: string;
  businessName: string;
}

export function buildNotificationEmail(params: NotificationEmailParams) {
  const dict = getDictionary('en');
  const emailDict = dict.emails.notification;

  const subject = emailDict.subject.replace('{name}', params.name);
  const timestamp = new Date().toISOString();
  const localeLabel = { en: 'English', es: 'Spanish', gl: 'Galician' }[params.locale];

  const text = `${emailDict.heading}

${emailDict.visitedLocale.replace('{locale}', localeLabel)}
${emailDict.submittedAt.replace('{timestamp}', timestamp)}

--- Contact Information ---
Name: ${params.name}
Email: ${params.email}
Age: ${params.age}
Gender: ${params.gender || 'Not provided'}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Work Sans', sans-serif; line-height: 1.6; color: #2c2016; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #241a13; color: #f4ead9; padding: 20px; }
    .content { padding: 20px; background: #f4ead9; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #c9b998; }
    th { background: #e9dcc4; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-family: 'EB Garamond', serif; font-size: 24px;">${params.businessName}</h1>
    </div>
    <div class="content">
      <h2>${emailDict.heading}</h2>
      <p><strong>${emailDict.visitedLocale.replace('{locale}', localeLabel)}</strong></p>
      <p><strong>${emailDict.submittedAt.replace('{timestamp}', timestamp)}</strong></p>

      <table>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Name</td>
          <td>${params.name}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>${params.email}</td>
        </tr>
        <tr>
          <td>Age</td>
          <td>${params.age}</td>
        </tr>
        <tr>
          <td>Gender</td>
          <td>${params.gender || 'Not provided'}</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
