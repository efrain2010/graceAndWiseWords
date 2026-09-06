export default {
  header: {
    logo: 'lendalore',
    heroLink: '#hero',
  },
  hero: {
    eyebrow: 'Enter the story of',
    title: 'lendalore',
    subtitle: 'Something is taking root in Galicia',
    description: 'Inspired by Galician nature, Celtic heritage, ancient history and the wisdom of the land',
    cta: 'Follow what is unfolding',
    contactLink: '#contact',
  },
  contact: {
    eyebrow: 'Follow what is unfolding',
    heading: 'Receive the whispers',
    intro: 'Stay close to the story and walk the path with us. Tell us a little about yourself and we\'ll follow up to be among the first to know.',
    form: {
      name: 'Full Name',
      nameRequired: 'Full Name *',
      namePlaceholder: 'Your full name',
      gender: 'Gender (optional)',
      genderPlaceholder: 'Prefer not to answer',
      genderOptions: {
        blank: 'Prefer not to answer',
        female: 'Female',
        male: 'Male',
        nonBinary: 'Non-binary',
      },
      age: 'Age',
      ageRequired: 'Age *',
      agePlaceholder: 'e.g. 34',
      email: 'Email',
      emailRequired: 'Email *',
      emailPlaceholder: 'you@example.com',
      submit: 'Enter the forest',
    },
    success: {
      heading: 'You\'re on the list',
      message: 'Thank you — we\'ve received your details and will be in touch with upcoming dates and next steps within a few days.',
      editButton: 'Edit your details',
    },
  },
  footer: {
    businessName: 'lendalore',
    copyright: '© {year} lendalore. All rights reserved.',
  },
  emails: {
    confirmation: {
      subject: 'Your message has found its way to us',
      greeting: 'Hello {name},',
      body: 'Your note has crossed the ivy gate and reached us. We are grateful for your interest in walking this path together.',
      followUp: 'Someone from our circle will follow up personally within a few days to share more about the journey ahead.',
      closing: 'With warm regards,',
      signature: 'lendalore',
    },
    notification: {
      subject: 'New retreat inquiry — {name}',
      heading: 'New Contact Form Submission',
      visitedLocale: 'Language: {locale}',
      submittedAt: 'Submitted at: {timestamp}',
    },
  },
};
