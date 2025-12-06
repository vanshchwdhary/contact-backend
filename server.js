import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const MAIL_TO = process.env.MAIL_TO;
const app = express();

app.use(cors());
app.use(express.json());
// Serve static assets (like vp-logo.png)
app.use("/static", express.static("."));

const resend = new Resend(process.env.RESEND_API_KEY);

const adminTemplate = (name, email, message) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Portfolio Message</title>

      <style>
        body {
          margin: 0;
          padding: 24px 0;
          background: #050b10;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #f9fbff;
        }

        .outer {
          width: 100%;
        }

        .card {
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
          background: radial-gradient(circle at top left, #172b3f 0, #071321 45%, #050b10 100%);
          border-radius: 18px;
          border: 1px solid #1f3448;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
          padding: 28px 26px 26px;
          box-sizing: border-box;
        }

        .logo-wrap {
          text-align: center;
          margin-bottom: 22px;
        }

        .logo-wrap img {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          display: inline-block;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(0, 224, 255, 0.08);
          color: #7de9ff;
          border: 1px solid rgba(0, 224, 255, 0.2);
          margin-bottom: 10px;
        }

        h1 {
          margin: 0 0 6px;
          font-size: 20px;
          text-align: center;
          font-weight: 650;
        }

        .subtitle {
          margin: 0 0 18px;
          font-size: 13px;
          text-align: center;
          color: #a2b7cb;
        }

        .meta-grid {
          width: 100%;
          margin-bottom: 14px;
          border-radius: 12px;
          background: rgba(9, 24, 40, 0.9);
          border: 1px solid #203347;
          padding: 12px 14px;
          box-sizing: border-box;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .meta-row:last-child {
          margin-bottom: 0;
        }

        .meta-label {
          color: #7f93a8;
        }

        .meta-value {
          color: #e5f1ff;
          font-weight: 500;
          text-align: right;
        }

        .message-block {
          margin-top: 16px;
        }

        .message-label {
          font-size: 13px;
          font-weight: 600;
          color: #c3d7ec;
          margin-bottom: 8px;
        }

        .message-box {
          background: radial-gradient(circle at top left, #172b3f 0, #0a1826 45%, #050b10 100%);
          border-radius: 12px;
          border: 1px solid #223953;
          padding: 14px 14px 16px;
          font-size: 14px;
          line-height: 1.6;
          color: #f3f7ff;
          white-space: pre-wrap;
        }

        .footer {
          margin-top: 18px;
          padding-top: 12px;
          border-top: 1px dashed rgba(138, 163, 188, 0.4);
          font-size: 11px;
          color: #7f93a8;
          text-align: center;
        }

        @media only screen and (max-width: 520px) {
          body {
            padding: 16px 0;
          }

          .card {
            margin: 0 14px;
            padding: 22px 18px 20px;
          }

          h1 {
            font-size: 18px;
          }

          .meta-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .meta-value {
            text-align: left;
          }
        }
      </style>
    </head>

    <body>
      <div class="outer">
        <div class="card">
          <div class="logo-wrap">
            <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" alt="VP Logo" />
          </div>

          <div class="badge">New portfolio contact</div>
          <h1>New Portfolio Contact Request</h1>
          <p class="subtitle">You just received a new message from your portfolio contact form.</p>

          <div class="meta-grid">
            <div class="meta-row">
              <span class="meta-label">From</span>
              <span class="meta-value">${name}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Email</span>
              <span class="meta-value">${email}</span>
            </div>
          </div>

          <div class="message-block">
            <div class="message-label">Message</div>
            <div class="message-box">${message}</div>
          </div>

          <div class="footer">© ${new Date().getFullYear()} Vansh Portfolio · Sent from your contact-backend service</div>
        </div>
      </div>
    </body>
  </html>
`;

const htmlTemplate = (name, userMessage) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email</title>

      <style>
        :root {
          --bg: #0c1a27;
          --card: #0f2233;
          --text: #ffffff;
          --subtext: #9bb4c9;
          --border: #1c3247;
          --box: #132e44;
          --accent: #00e0ff;
        }

        @media (prefers-color-scheme: light) {
          :root {
            --bg: #f5f7fa;
            --card: #ffffff;
            --text: #000000;
            --subtext: #555555;
            --border: #d9e2ec;
            --box: #f1f4f8;
            --accent: #0077ff;
          }
        }

        body {
          background-color: var(--bg);
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: var(--text);
        }

        .container {
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          background: var(--card);
          padding: 30px;
          border-radius: 14px;
          border: 1px solid var(--border);
          box-sizing: border-box;
        }

        .logo {
          text-align: center;
          margin-bottom: 25px;
        }

        .logo img {
          width: 85px;
        }

        h2 {
          font-weight: 650;
          margin-bottom: 18px;
          color: var(--text);
          text-align: center;
        }

        p {
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 12px 0;
          color: var(--text);
        }

        .message-box {
          background: var(--box);
          padding: 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
          margin-top: 16px;
        }

        .message-title {
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--accent);
        }

        .btn-group {
          text-align: center;
          margin-top: 25px;
        }

        .btn-group a {
          display: inline-block;
          margin: 6px;
          padding: 10px 18px;
          background: var(--accent);
          color: #000000;
          text-decoration: none;
          font-weight: bold;
          border-radius: 8px;
          font-size: 14px;
        }

        .signature-card {
          margin-top: 25px;
          display: flex;
          align-items: center;
          background: var(--box);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .sig-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          margin-right: 15px;
        }

        .sig-info {
          line-height: 1.4;
        }

        .footer {
          margin-top: 38px;
          text-align: center;
          font-size: 13px;
          color: var(--subtext);
        }

        @media only screen and (max-width: 480px) {
          .container {
            padding: 18px;
          }

          .logo img {
            width: 64px;
          }

          p {
            font-size: 14px;
          }

          .message-box {
            padding: 14px;
          }

          .signature-card {
            flex-direction: column;
            text-align: center;
          }

          .sig-avatar {
            margin-bottom: 12px;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="logo">
          <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" alt="VP Logo" />
        </div>

        <h2>We’ve received your message!</h2>

        <p>Hi ${name},</p>

        <p>
          Thank you for reaching out! Your message has been received successfully.
          I truly appreciate you taking the time to connect — I will personally get back
          to you as soon as possible.
        </p>

        <div class="message-box">
          <div class="message-title">Your Message:</div>
          <div>${userMessage}</div>
        </div>

        <div class="btn-group">
          <a href="https://farmfixer.xyz">Visit Portfolio</a>
          <a href="https://linkedin.com/in/vanshchwdhary">LinkedIn</a>
          <a href="https://github.com/vanshchwdhary">GitHub</a>
        </div>

        <div class="signature-card">
          <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" class="sig-avatar" alt="VP Logo" />
          <div class="sig-info">
            <strong>Vansh Phalswal</strong><br />
            Web Developer • Designer<br />
            contact@drkake.org
          </div>
        </div>

        <div class="footer">
          This is an automated confirmation email from my portfolio.<br />
          © ${new Date().getFullYear()} Vansh Portfolio
        </div>
      </div>
    </body>
  </html>
`;

app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }

  const mailToYou = {
    from: "Vansh Portfolio <contact@drkake.org>",
    to: MAIL_TO,
    subject: `New message from ${name}`,
    html: adminTemplate(name, email, message),
  };

  const autoReply = {
    from: "Vansh Portfolio <contact@drkake.org>",
    to: email,
    subject: "Thanks for contacting me!",
    html: htmlTemplate(name, message),
  };

  try {
    await resend.emails.send(mailToYou);
    await resend.emails.send(autoReply);

    res.json({ success: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));