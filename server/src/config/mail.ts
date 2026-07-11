import nodemailer from "nodemailer";

// Initialize the nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER || "no-reply@param20h.tech",
    pass: process.env.SMTP_PASS || "",
  },
  tls: {
    // Avoid handshake/greeting drops on cloud servers by allowing self-signed/unauthorized certificates
    rejectUnauthorized: false
  }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Mailer Connection Verification Failed:", error.message);
  } else {
    console.log("✅ SMTP Mailer is ready to deliver messages");
  }
});

/**
 * Sends a welcome/confirmation email when a user unlocks the ZenithFlow Pro plan.
 */
export async function sendProUpgradeEmail(toEmail: string, userName: string): Promise<boolean> {
  const fromName = process.env.SMTP_FROM_NAME || "ZenithFlow";
  const fromEmail = process.env.SMTP_FROM_EMAIL || "no-reply@param20h.tech";

  // HTML content matching the premium aesthetic of ZenithFlow (Dark theme, sleek design, gradients)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ZenithFlow Pro Unlocked</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #09090b;
          color: #fafafa;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #111114;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        .header {
          padding: 40px;
          text-align: center;
          background: linear-gradient(135deg, #1e1b4b 0%, #09090b 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #ffffff;
          margin-bottom: 10px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .logo-accent {
          background: linear-gradient(to right, #a78bfa, #f9a8d4, #fdba74);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .content {
          padding: 40px;
        }
        h1 {
          font-size: 28px;
          font-weight: 800;
          margin-top: 0;
          margin-bottom: 16px;
          background: linear-gradient(to right, #ffffff, #a1a1aa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #a1a1aa;
          margin-bottom: 24px;
        }
        .features-list {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          font-size: 14px;
          color: #e4e4e7;
        }
        .feature-item:last-child {
          margin-bottom: 0;
        }
        .feature-icon {
          color: #a78bfa;
          margin-right: 12px;
          font-weight: bold;
        }
        .cta-button {
          display: block;
          text-align: center;
          background: linear-gradient(to right, #a78bfa, #f9a8d4, #fdba74);
          color: #000000 !important;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 16px 32px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
          transition: all 0.3s ease;
        }
        .footer {
          padding: 32px 40px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 12px;
          color: #71717a;
          background-color: rgba(0, 0, 0, 0.2);
        }
        .footer a {
          color: #a78bfa;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span>Zenith<span class="logo-accent">Flow</span></span>
          </div>
        </div>
        <div class="content">
          <h1>Master Your Velocity, ${userName}!</h1>
          <p>We are thrilled to let you know that your account has been upgraded to <strong>ZenithFlow Pro</strong>. You now have complete, unrestricted access to our entire premium productivity ecosystem.</p>
          
          <div class="features-list">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <div><strong>Full AI Coach Feedback:</strong> Get detailed biometric, nutrition, and daily focus recommendations.</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <div><strong>Unlimited Gym Volumes:</strong> Track and analyze your sets, reps, and workouts without limitations.</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <div><strong>Deep Analytics Trends:</strong> Unlock interactive graphs showing focus blocks, habit adherence, and productivity patterns.</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <div><strong>Priority Support:</strong> Get premium service speed response directly from our team.</div>
            </div>
          </div>
          
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="cta-button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ZenithFlow. All rights reserved.</p>
          <p>Sent to you because you successfully unlocked Pro plan on ZenithFlow.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: "⚡ ZenithFlow Pro Activated! Welcome to the premium zone.",
      text: `Hello ${userName},\n\nWelcome to ZenithFlow Pro! Your account has been upgraded and you have unlocked all premium features, including the AI Coach, Unlimited Gym Log, and advanced Focus Analytics.\n\nVisit your dashboard at ${process.env.CLIENT_URL || "http://localhost:3000"}/dashboard to start exploring.\n\nBest,\nZenithFlow Team`,
      html: htmlContent,
    });

    console.log("Pro upgrade email sent successfully to %s: %s", toEmail, info.messageId);
    return true;
  } catch (err) {
    console.error("Failed to send Pro upgrade email to %s:", toEmail, err);
    return false;
  }
}
