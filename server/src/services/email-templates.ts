/**
 * Additional Production-Grade Email Templates
 * 
 * This file contains pre-built email templates for common scenarios:
 * - Password Reset
 * - Email Change Confirmation
 * - Account Deletion
 * - Premium Subscription Confirmation
 * - Payment Failed
 * - Weekly Meal Plan Summary
 */

import {
  createEmailTemplate,
  createContentSection,
  createFeatureBox,
  createInfoBox,
  createOrderedList,
} from '../templates/email-base.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Password Reset Email
 */
export function createPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): { subject: string; html: string } {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content =
    createContentSection({
      title: `Hi ${name},`,
      text: 'We received a request to reset your password for your NutriGuide account. Click the button below to create a new password.',
    }) +
    createInfoBox({
      text: `<strong>Reset Link:</strong><br><a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>`,
      type: 'info',
    }) +
    createInfoBox({
      text: '<strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn\'t request a password reset, please ignore this email or contact support if you\'re concerned about your account security.',
      type: 'warning',
    });

  const html = createEmailTemplate({
    preheader: 'Reset your NutriGuide password',
    title: 'Password Reset Request',
    content,
    ctaText: '🔒 Reset Password',
    ctaUrl: resetUrl,
    footerText: 'This link expires in 1 hour for security reasons.',
    unsubscribeUrl,
  });

  return {
    subject: `Reset your NutriGuide password, ${name}`,
    html,
  };
}

/**
 * Email Change Confirmation
 */
export function createEmailChangeConfirmationEmail(
  oldEmail: string,
  newEmail: string,
  name: string,
  confirmToken: string
): { subject: string; html: string } {
  const confirmUrl = `${FRONTEND_URL}/confirm-email-change?token=${confirmToken}`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(newEmail)}`;

  const content =
    createContentSection({
      title: `Hi ${name},`,
      text: `You recently requested to change your email address from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.`,
    }) +
    createContentSection({
      text: 'To complete this change, please verify your new email address by clicking the button below.',
    }) +
    createInfoBox({
      text: '<strong>⚠️ Important:</strong> After confirmation, you\'ll need to use your new email address to log in.',
      type: 'warning',
    });

  const html = createEmailTemplate({
    preheader: 'Confirm your new email address',
    title: 'Confirm Email Change',
    content,
    ctaText: '✓ Confirm New Email',
    ctaUrl: confirmUrl,
    footerText: 'This link will expire in 24 hours.',
    unsubscribeUrl,
  });

  return {
    subject: `Confirm your new email address, ${name}`,
    html,
  };
}

/**
 * Premium Subscription Confirmation
 */
export function createPremiumWelcomeEmail(
  email: string,
  name: string
): { subject: string; html: string } {
  const dashboardUrl = `${FRONTEND_URL}/`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content =
    createContentSection({
      title: `Welcome to Premium, ${name}! 🌟`,
      text: 'Thank you for upgrading to NutriGuide Premium! You now have access to all our exclusive features.',
    }) +
    createFeatureBox({
      title: '✨ Your Premium Benefits:',
      items: [
        '<strong>Unlimited AI Recommendations</strong> - Get personalized meal suggestions anytime',
        '<strong>Advanced Meal Planning</strong> - Plan meals for unlimited weeks ahead',
        '<strong>Unlimited Family Groups</strong> - Collaborate with as many families as you want',
        '<strong>Full Nutrition Analytics</strong> - Track your nutrition history without limits',
        '<strong>Priority Support</strong> - Get help faster when you need it',
        '<strong>Export Features</strong> - Download your meal plans and shopping lists',
      ],
    }) +
    createOrderedList({
      title: '🚀 Get Started with Premium:',
      items: [
        'Try the AI meal recommendation feature',
        'Create a meal plan for the entire month',
        'Invite your family to collaborate',
        'Explore the advanced nutrition dashboard',
      ],
    }) +
    createContentSection({
      text: 'Thank you for supporting NutriGuide! We\'re committed to helping you achieve your healthy eating goals.',
    });

  const html = createEmailTemplate({
    preheader: 'Welcome to NutriGuide Premium! Unlock all features now.',
    title: 'Welcome to Premium',
    content,
    ctaText: '🎉 Explore Premium Features',
    ctaUrl: dashboardUrl,
    footerText: 'Questions about your subscription? Contact us anytime.',
    unsubscribeUrl,
  });

  return {
    subject: `Welcome to NutriGuide Premium, ${name}! 🌟`,
    html,
  };
}

/**
 * Payment Failed Email
 */
export function createPaymentFailedEmail(
  email: string,
  name: string
): { subject: string; html: string } {
  const billingUrl = `${FRONTEND_URL}/settings/billing`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content =
    createContentSection({
      title: `Hi ${name},`,
      text: 'We had trouble processing your payment for NutriGuide Premium. Your subscription will be paused until we can successfully charge your payment method.',
    }) +
    createInfoBox({
      text: '<strong>⚠️ Action Required:</strong> Please update your payment information to continue enjoying Premium features.',
      type: 'warning',
    }) +
    createOrderedList({
      title: 'How to Update Your Payment Method:',
      items: [
        'Click the button below to go to billing settings',
        'Update your payment information',
        'We\'ll automatically retry the payment',
      ],
    }) +
    createContentSection({
      text: 'If you have any questions or need assistance, please don\'t hesitate to contact our support team.',
    });

  const html = createEmailTemplate({
    preheader: 'Action required: Update your payment method',
    title: 'Payment Update Required',
    content,
    ctaText: '💳 Update Payment Method',
    ctaUrl: billingUrl,
    footerText: 'Need help? Contact support@nutriguide.com',
    unsubscribeUrl,
  });

  return {
    subject: `Action Required: Update your payment method, ${name}`,
    html,
  };
}

/**
 * Weekly Meal Plan Summary
 */
export function createWeeklyMealPlanEmail(
  email: string,
  name: string,
  weekStart: string,
  mealCount: number
): { subject: string; html: string } {
  const mealPlanUrl = `${FRONTEND_URL}/meal-planner`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content =
    createContentSection({
      title: `Your Meal Plan for ${weekStart} 📅`,
      text: `Hi ${name}! Here's a quick summary of your meal plan for the week ahead.`,
    }) +
    createInfoBox({
      text: `<strong>📊 This Week:</strong> You have ${mealCount} meals planned. Great job staying organized!`,
      type: 'success',
    }) +
    createOrderedList({
      title: '✅ Quick Actions:',
      items: [
        'Review your meal plan and make any adjustments',
        'Generate your shopping list for the week',
        'Prep ingredients for the week ahead',
        'Share your plan with family members',
      ],
    }) +
    createContentSection({
      text: 'Remember, meal planning is key to eating healthy and saving time. Keep up the great work!',
    });

  const html = createEmailTemplate({
    preheader: `Your meal plan for ${weekStart} is ready!`,
    title: 'Weekly Meal Plan Summary',
    content,
    ctaText: '📋 View Full Meal Plan',
    ctaUrl: mealPlanUrl,
    footerText: 'Want to change how often you receive these emails? Update your preferences.',
    unsubscribeUrl,
  });

  return {
    subject: `Your meal plan for ${weekStart} 🍽️`,
    html,
  };
}

/**
 * Account Deletion Confirmation
 */
export function createAccountDeletionEmail(
  email: string,
  name: string
): { subject: string; html: string } {
  const content =
    createContentSection({
      title: `Goodbye, ${name} 👋`,
      text: 'Your NutriGuide account has been successfully deleted. We\'re sorry to see you go!',
    }) +
    createInfoBox({
      text: '<strong>What happens next:</strong><br>• All your data has been permanently deleted<br>• Your subscription (if any) has been canceled<br>• You will no longer receive emails from us',
      type: 'info',
    }) +
    createContentSection({
      text: 'If you change your mind, you\'re always welcome to create a new account. We\'d love to have you back!',
    }) +
    createContentSection({
      html: '<p style="margin: 16px 0 0; color: #374151; font-size: 16px;">Thank you for being part of the NutriGuide community.<br><strong>The NutriGuide Team</strong></p>',
    });

  const html = createEmailTemplate({
    preheader: 'Your account has been deleted',
    title: 'Account Deleted',
    content,
    footerText: 'This is the last email you\'ll receive from us.',
  });

  return {
    subject: `Your NutriGuide account has been deleted`,
    html,
  };
}

/**
 * Family Invitation Email
 */
export function createFamilyInvitationEmail(
  email: string,
  inviterName: string,
  familyName: string,
  inviteCode: string
): { subject: string; html: string } {
  const joinUrl = `${FRONTEND_URL}/family/join?code=${inviteCode}`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content =
    createContentSection({
      title: `You've been invited! 🎉`,
      text: `<strong>${inviterName}</strong> has invited you to join their family group "<strong>${familyName}</strong>" on NutriGuide.`,
    }) +
    createFeatureBox({
      title: '👨‍👩‍👧‍👦 Family Features:',
      items: [
        '<strong>Collaborative Meal Planning</strong> - Plan meals together',
        '<strong>Meal Voting</strong> - Vote on what to cook',
        '<strong>Shared Shopping Lists</strong> - Never forget an ingredient',
        '<strong>Family Chat</strong> - Discuss meals in real-time',
      ],
    }) +
    createInfoBox({
      text: `<strong>Invite Code:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${inviteCode}</code>`,
      type: 'info',
    });

  const html = createEmailTemplate({
    preheader: `${inviterName} invited you to join ${familyName} on NutriGuide`,
    title: 'Family Invitation',
    content,
    ctaText: '👨‍👩‍👧‍👦 Join Family Group',
    ctaUrl: joinUrl,
    footerText: 'This invitation will expire in 7 days.',
    unsubscribeUrl,
  });

  return {
    subject: `${inviterName} invited you to join ${familyName} on NutriGuide`,
    html,
  };
}
