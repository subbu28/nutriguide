import { Resend } from 'resend';
import {
  createEmailTemplate,
  createContentSection,
  createFeatureBox,
  createInfoBox,
  createOrderedList,
} from '../templates/email-base.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'NutriGuide <noreply@nutriguide.app>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // If no Resend API key, log to console (development mode)
  if (!resend) {
    console.log('='.repeat(60));
    console.log('📧 EMAIL (Dev Mode - No RESEND_API_KEY configured)');
    console.log('='.repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('-'.repeat(60));
    console.log(options.html.replace(/<[^>]*>/g, '')); // Strip HTML for console
    console.log('='.repeat(60));
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content = 
    createContentSection({
      title: `Welcome, ${name}! 👋`,
      text: 'Thanks for signing up for NutriGuide! Please verify your email address to complete your registration and start discovering healthy meals.',
    }) +
    createInfoBox({
      text: `<strong>Verification Link:</strong><br><a href="${verifyUrl}" style="color: #10b981; word-break: break-all;">${verifyUrl}</a>`,
      type: 'info',
    }) +
    createContentSection({
      text: '<small>This link will expire in 24 hours. If you didn\'t create an account, you can safely ignore this email.</small>',
    });

  const html = createEmailTemplate({
    preheader: 'Verify your email address to get started with NutriGuide',
    title: 'Verify Your Email - NutriGuide',
    content,
    ctaText: '✓ Verify Email Address',
    ctaUrl: verifyUrl,
    footerText: 'Need help? Contact us at support@nutriguide.com',
    unsubscribeUrl,
  });

  return sendEmail({
    to: email,
    subject: `Verify your NutriGuide account, ${name}`,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const dashboardUrl = `${FRONTEND_URL}/`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content =
    createContentSection({
      title: `Welcome aboard, ${name}! 🎉`,
      text: "We're thrilled to have you join the NutriGuide community! Your account is now active and ready to help you discover delicious, healthy meals tailored to your preferences.",
    }) +
    createFeatureBox({
      title: '🌟 What You Can Do Now:',
      items: [
        '<strong>Browse Thousands of Recipes</strong> - Discover healthy meals from around the world',
        '<strong>AI-Powered Recommendations</strong> - Get personalized meal suggestions based on your preferences',
        '<strong>Plan Your Week</strong> - Create custom meal plans and never wonder "what\'s for dinner?"',
        '<strong>Track Nutrition</strong> - Monitor your calorie and nutrient intake effortlessly',
        '<strong>Family Collaboration</strong> - Share meals and vote on what to cook together',
        '<strong>Smart Shopping Lists</strong> - Generate grocery lists from your meal plans',
      ],
    }) +
    createOrderedList({
      title: '💡 Quick Tips to Get Started:',
      items: [
        'Set your dietary preferences in Settings to get better recommendations',
        'Create your first meal plan for the week ahead',
        'Invite family members to collaborate on meal planning',
        'Save your favorite recipes for quick access later',
      ],
    }) +
    createContentSection({
      text: "If you have any questions or need help getting started, just reply to this email. We're here to help!",
    }) +
    createContentSection({
      html: '<p style="margin: 16px 0 0; color: #374151; font-size: 16px;">Happy cooking! 👨‍🍳<br><strong>The NutriGuide Team</strong></p>',
    });

  const html = createEmailTemplate({
    preheader: 'Your journey to healthy eating starts now! Discover thousands of recipes and meal plans.',
    title: 'Welcome to NutriGuide',
    content,
    ctaText: '🚀 Start Exploring Meals',
    ctaUrl: dashboardUrl,
    footerText: 'Need help? Visit our Help Center or reply to this email.',
    unsubscribeUrl,
  });

  return sendEmail({
    to: email,
    subject: `Welcome to NutriGuide, ${name}!`,
    html,
  });
}

export function generateVerificationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours
  return expiry;
}
