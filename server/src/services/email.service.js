
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import logger from '../utils/logger.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../templates/emails');


let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

   if (!config.mail.host) {
    logger.warn('Email transporter not configured (SMTP_HOST is empty)');
    transporter = {
      sendMail: async (options) => {
        logger.info('Email (stub — no SMTP configured)', {
          to: options.to,
          subject: options.subject,
        });
        return { messageId: `stub-${Date.now()}` };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth:
      config.mail.user && config.mail.pass
        ? { user: config.mail.user, pass: config.mail.pass }
        : undefined,
  });

  return transporter;
};


const renderTemplate = async (templateName, vars) => {
  const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  let html;
  try {
    html = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    logger.error('Email template not found', { templateName, error: err.message });
    throw new Error(`Email template not found: ${templateName}`);
  }

  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : '';
  });
};


const sendMail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  const from = `${config.app.name} <${config.mail.from}>`;

  try {
    const info = await t.sendMail({ from, to, subject, html, text });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return info;
  } catch (err) {
    
    logger.warn('Email send failed, retrying once', { to, subject, error: err.message });
    await new Promise((r) => setTimeout(r, 1000));
    const info = await t.sendMail({ from, to, subject, html, text });
    logger.info('Email sent on retry', { to, subject, messageId: info.messageId });
    return info;
  }
};


const sendVerificationEmail = async (user, verificationUrl) => {
  const html = await renderTemplate('verifyEmail', {
    firstName: user.firstName,
    username: user.username,
    verificationUrl,
    appName: config.app.name,
    expiryHours: 24,
  });

  try {
    await sendMail({
      to: user.email,
      subject: `Verify your email for ${config.app.name}`,
      html,
    });
  } catch (err) {
    
    logger.error('Verification email failed', {
      userId: String(user._id),
      email: user.email,
      error: err.message,
    });
  }
};


const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = await renderTemplate('resetPassword', {
    firstName: user.firstName,
    username: user.username,
    resetUrl,
    appName: config.app.name,
    expiryMinutes: 60,
  });

  try {
    await sendMail({
      to: user.email,
      subject: `Reset your password for ${config.app.name}`,
      html,
    });
  } catch (err) {
    logger.error('Password reset email failed', {
      userId: String(user._id),
      email: user.email,
      error: err.message,
    });
  }
};


const sendWelcomeEmail = async (user) => {
  const html = await renderTemplate('welcome', {
    firstName: user.firstName,
    username: user.username,
    appName: config.app.name,
    clientUrl: config.app.clientUrl,
  });

  try {
    await sendMail({
      to: user.email,
      subject: `Welcome to ${config.app.name}`,
      html,
    });
  } catch (err) {
    logger.error('Welcome email failed', {
      userId: String(user._id),
      email: user.email,
      error: err.message,
    });
  }
};


const sendBudgetAlertEmail = async (user, { budget, spentCents, overBudget }) => {
  const html = await renderTemplate('budgetAlert', {
    firstName: user.firstName,
    appName: config.app.name,
    budgetName: budget.name,
    budgetAmount: (budget.amountCents / 100).toFixed(2),
    spentAmount: (spentCents / 100).toFixed(2),
    percentage: Math.round((spentCents / budget.amountCents) * 100),
    overBudget: overBudget ? 'Yes' : 'No',
  });

  try {
    await sendMail({
      to: user.email,
      subject: `${overBudget ? 'Over budget' : 'Budget alert'}: ${budget.name}`,
      html,
    });
  } catch (err) {
    logger.error('Budget alert email failed', {
      userId: String(user._id),
      budgetId: String(budget._id),
      error: err.message,
    });
  }
};


const sendGoalReachedEmail = async (user, goal) => {
  const html = await renderTemplate('goalReached', {
    firstName: user.firstName,
    appName: config.app.name,
    goalName: goal.name,
    targetAmount: (goal.targetAmountCents / 100).toFixed(2),
    clientUrl: config.app.clientUrl,
  });

  try {
    await sendMail({
      to: user.email,
      subject: `Goal reached: ${goal.name}`,
      html,
    });
  } catch (err) {
    logger.error('Goal reached email failed', {
      userId: String(user._id),
      goalId: String(goal._id),
      error: err.message,
    });
  }
};


export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendBudgetAlertEmail,
  sendGoalReachedEmail,
};