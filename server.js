import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
console.log("MAIL_TO =", process.env.MAIL_TO);
const MAIL_TO = process.env.MAIL_TO;
const app = express();
app.use(cors());
app.use(express.json());
app.use("/static", express.static("."));

const resend = new Resend(process.env.RESEND_API_KEY);

const adminTemplate = (name, email, message) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Message</title>

      <style>
        body {
          background-color: #0c1a27;
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          color: #ffffff;
        }

        .container {
          max-width: 600px;
          width: 100%;
          margin: auto;
          background: #0f2233;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #1c3247;
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
          text-align: center;
          font-weight: 600;
          margin-bottom: 20px;
          color: #ffffff;
        }

        p {
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 8px 0;
        }

        .footer {
          margin-top: 35px;
          text-align: center;
          font-size: 13px;
          color: #8295a8;
        }

        .box {
          background: #132e44;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
          border: 1px solid #1c415c;
        }

        @media only screen and (max-width: 480px) {
          .container {
            padding: 18px;
            border-radius: 10px;
          }

          .logo img {
            width: 64px;
          }

          h2 {
            font-size: 18px;
            margin-bottom: 14px;
          }

          p {
            font-size: 14px;
            line-height: 1.5;
          }

          .box {
            padding: 12px;
          }

          .footer {
            font-size: 12px;
            margin-top: 24px;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="logo">
          <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" alt="VP Logo" />
        </div>

        <h2>New Portfolio Contact Request</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <div class="box">
          <strong>Message:</strong>
          <p>${message}</p>
        </div>

        <div class="footer">© ${new Date().getFullYear()} Vansh Portfolio</div>
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
            --subtext: #555;
            --border: #d9e2ec;
            --box: #f1f4f8;
            --accent: #0077ff;
          }
        }

        body {
          background-color: var(--bg);
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          color: var(--text);
        }

        .container {
          max-width: 600px;
          width: 100%;
          margin: auto;
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
          color: #000;
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
          .container { padding: 18px; }
          .logo img { width: 64px; }
          p { font-size: 14px; }
          .message-box { padding: 14px; }
          .signature-card { flex-direction: column; text-align: center; }
          .sig-avatar { margin-bottom: 12px; }
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
          <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" class="sig-avatar" />
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
    return res
      .status(400)
      .json({ success: false, error: "All fields required" });
  }

  // Email sent TO YOU
  const mailToYou = {
    from: "Vansh Portfolio <contact@drkake.org>",
    to: MAIL_TO,
    subject: `New message from ${name}`,
    html: adminTemplate(name, email, message),
  };

  // Auto Reply to USER
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