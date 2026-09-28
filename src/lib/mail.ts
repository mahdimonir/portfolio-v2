import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER || "";
const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendContactNotification({
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const senderName = `${firstName} ${lastName}`.trim();
  const emailSubject = subject?.trim()
    ? `[Portfolio Contact] ${subject.trim()}`
    : `[Portfolio Contact] New message from ${senderName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px; }
          .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 28px; max-width: 600px; margin: 0 auto; }
          .header { border-bottom: 1px solid #27272a; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; letter-spacing: -0.02em; margin: 0; }
          .sub { font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
          .field { margin-bottom: 16px; }
          .label { font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .value { font-size: 14px; color: #ffffff; }
          .message-box { background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap; }
          .footer { font-size: 11px; color: #52525b; text-align: center; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.1em; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">New Inquiry Received</h1>
            <div class="sub">Portfolio Contact Form</div>
          </div>
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">${senderName}</div>
          </div>
          <div class="field">
            <div class="label">Sender Email</div>
            <div class="value"><a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a></div>
          </div>
          ${
            subject
              ? `
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${subject}</div>
          </div>`
              : ""
          }
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${message}</div>
          </div>
          <div class="footer">Sent from your Full-Stack Developer Portfolio</div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${senderName}" <${smtpUser}>`,
    to: smtpUser,
    replyTo: email,
    subject: emailSubject,
    text: `New contact from ${senderName} (${email}):\n\nSubject: ${subject || "N/A"}\n\n${message}`,
    html: htmlContent,
  });
}
