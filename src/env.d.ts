/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        EMAIL: {
          send(message: EmailMessage): Promise<{ success: boolean }>;
        };
        TURNSTILE_SECRET_KEY: string;
        TURNSTILE_SITE_KEY: string;
        CONTACT_FROM_ADDRESS: string;
        OWNER_NOTIFICATION_ADDRESS: string;
        BUSINESS_NAME: string;
      };
    };
  }
}

interface EmailMessage {
  from: {
    email: string;
    name?: string;
  };
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}
