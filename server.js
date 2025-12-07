import rateLimit from "express-rate-limit";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import mongoose from "mongoose";


dotenv.config();

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Error:", err));

const MAIL_TO = process.env.MAIL_TO;
const app = express();

// Rate limiter: max 3 messages per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many messages from this IP, please try again after an hour.",
  },
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/", (req, res) => {
  res.send("Backend running OK");
});
app.use(express.json());
// Serve static assets (like vp-logo.png)
app.use("/static", express.static("."));

const resend = new Resend(process.env.RESEND_API_KEY);
// ===== MongoDB Contact Message Schema =====
const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
  },
  { timestamps: true }
);

const ContactMessage = mongoose.model("ContactMessage", contactSchema);
// ==========================================

const adminTemplate = (name, email, message) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Portfolio Message</title>

      <style>
        :root {
          --bg: #f5f7fa;
          --card: #ffffff;
          --border: #e1e8f0;
          --shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          --heading: #111827;
          --text: #1f2933;
          --muted: #6b7280;
          --accent: #2563eb;
          --badge-bg: #e0edff;
          --badge-text: #1d4ed8;
          --pill-bg: #f3f4f6;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #020617;
            --card: #020617;
            --border: #1e293b;
            --shadow: 0 24px 60px rgba(15, 23, 42, 0.85);
            --heading: #f9fafb;
            --text: #e5e7eb;
            --muted: #9ca3af;
            --accent: #60a5fa;
            --badge-bg: rgba(96, 165, 250, 0.12);
            --badge-text: #bfdbfe;
            --pill-bg: #020617;
          }
        }

        body {
          margin: 0;
          padding: 32px 16px;
          background: var(--bg);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
          color: var(--text);
        }

        .outer {
          max-width: 760px;
          margin: 0 auto;
        }

        .card {
          background: var(--card);
          border-radius: 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          padding: 28px 28px 24px;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vp-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #020617;
          overflow: hidden;
        }

        .vp-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .brand-text {
          font-size: 14px;
          color: var(--muted);
        }

        .brand-text strong {
          display: block;
          font-size: 15px;
          color: var(--heading);
        }

        .badge {
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--badge-bg);
          color: var(--badge-text);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          white-space: nowrap;
        }

        h1 {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 650;
          color: var(--heading);
        }

        .subtitle {
          margin: 0 0 18px;
          font-size: 14px;
          color: var(--muted);
        }

        .meta-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 16px;
          border-radius: 18px;
          background: var(--pill-bg);
          border: 1px solid var(--border);
          margin-bottom: 18px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 14px;
        }

        .meta-label {
          color: var(--muted);
        }

        .meta-value {
          font-weight: 500;
          color: var(--heading);
          text-align: right;
        }

        .message-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .message-box {
          border-radius: 18px;
          border: 1px solid var(--border);
          background: #f9fafb;
          padding: 16px 18px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text);
          white-space: pre-wrap;
        }

        @media (prefers-color-scheme: dark) {
          .message-box {
            background: #020617;
          }
        }

        .footer {
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.25);
          font-size: 12px;
          color: var(--muted);
          text-align: center;
        }

        @media only screen and (max-width: 520px) {
          body {
            padding: 20px 12px;
          }

          .card {
            padding: 22px 18px 20px;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
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
          <div class="header">
            <div class="brand">
              <div class="vp-logo">
                <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" alt="VP Logo" />
              </div>
              <div class="brand-text">
                <strong>New portfolio contact</strong>
                Incoming message from your site
              </div>
            </div>
            <div class="badge">Admin copy</div>
          </div>
          <div class="signature" style="display:flex;align-items:center;gap:14px;margin-top:10px;">
            <div class="avatar" style="width:40px;height:40px;border-radius:50%;overflow:hidden;box-shadow:0 6px 16px rgba(15,23,42,0.18);">
              <img src="https://contact-backend-v7b0.onrender.com/static/vansh-avatar.png" alt="Vansh Avatar" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
            <div class="sig-text" style="font-size:13px;line-height:1.5;color:var(--text);">
              <strong style="font-size:14px;color:var(--heading);">Vansh Phalswal</strong><br />
              Admin Copy · Portfolio Owner
            </div>
          </div>

          <h1>New Portfolio Contact Request</h1>
          <p class="subtitle">
            You just received a new message from your portfolio contact form.
          </p>

          <div class="meta-card">
            <div class="meta-row">
              <div class="meta-label">From</div>
              <div class="meta-value">${name}</div>
            </div>
            <div class="meta-row">
              <div class="meta-label">Email</div>
              <div class="meta-value">${email}</div>
            </div>
          </div>

          <div>
            <div class="message-title">Message</div>
            <div class="message-box">
              ${message}
            </div>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} Vansh Portfolio · Sent from your contact-backend service
          </div>
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
      <title>We’ve received your message</title>

      <style>
        :root {
          --bg: #f5f7fa;
          --card: #ffffff;
          --border: #e1e8f0;
          --shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          --heading: #111827;
          --text: #1f2933;
          --muted: #6b7280;
          --accent: #2563eb;
          --pill-bg: #f3f4f6;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #020617;
            --card: #020617;
            --border: #1e293b;
            --shadow: 0 24px 60px rgba(15, 23, 42, 0.85);
            --heading: #f9fafb;
            --text: #e5e7eb;
            --muted: #9ca3af;
            --accent: #60a5fa;
            --pill-bg: #020617;
          }
        }

        body {
          margin: 0;
          padding: 32px 16px;
          background: var(--bg);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
          color: var(--text);
        }

        .outer {
          max-width: 760px;
          margin: 0 auto;
        }

        .card {
          background: var(--card);
          border-radius: 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          padding: 28px 28px 26px;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vp-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #020617;
          overflow: hidden;
        }

        .vp-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .brand-text {
          font-size: 14px;
          color: var(--muted);
        }

        .brand-text strong {
          display: block;
          font-size: 15px;
          color: var(--heading);
        }

        .tag {
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--pill-bg);
          color: var(--muted);
          font-size: 11px;
          white-space: nowrap;
        }

        h2 {
          margin: 0 0 10px;
          font-size: 22px;
          font-weight: 650;
          color: var(--heading);
        }

        p {
          font-size: 14px;
          line-height: 1.7;
          margin: 0 0 10px;
          color: var(--text);
        }

        .message-box {
          margin-top: 18px;
          padding: 16px 18px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: var(--pill-bg);
        }

        .message-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .message-body {
          font-size: 14px;
          color: var(--text);
          white-space: pre-wrap;
        }

        .btn-row {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .btn {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .btn-ghost {
          background: transparent;
          color: var(--muted);
          border-color: var(--border);
        }

        .signature {
          margin-top: 26px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sig-text {
          font-size: 13px;
          line-height: 1.5;
        }

        .sig-text strong {
          font-size: 14px;
          color: var(--heading);
        }

        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: var(--muted);
          text-align: center;
        }

        @media only screen and (max-width: 520px) {
          body {
            padding: 20px 12px;
          }

          .card {
            padding: 22px 18px 20px;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .btn-row {
            flex-direction: column;
          }

          .signature {
            align-items: flex-start;
          }
        }
      </style>
    </head>

    <body>
      <div class="outer">
        <div class="card">
          <div class="header">
            <div class="brand">
              <div class="vp-logo">
                <img src="https://contact-backend-v7b0.onrender.com/static/vp-logo.png" alt="VP Logo" />
              </div>
              <div class="brand-text">
                <strong>Vansh Portfolio</strong>
                Thanks for reaching out
              </div>
            </div>
            <div class="tag">Message received</div>
          </div>

          <h2>We’ve received your message</h2>

          <p>Hi ${name},</p>
          <p>
            Thank you for reaching out! Your message has been received successfully.
            I really appreciate you taking the time to connect — I’ll personally get
            back to you as soon as possible.
          </p>

          <div class="message-box">
            <div class="message-title">Your message</div>
            <div class="message-body">
              ${userMessage}
            </div>
          </div>

          <div class="btn-row">
            <a href="https://farmfixer.xyz" class="btn btn-primary">Visit portfolio</a>
            <a href="https://linkedin.com/in/vanshchwdhary" class="btn btn-ghost">LinkedIn</a>
            <a href="https://github.com/vanshchwdhary" class="btn btn-ghost">GitHub</a>
          </div>

          <div class="signature">
            <div class="avatar" style="width:40px;height:40px;border-radius:50%;overflow:hidden;box-shadow:0 6px 16px rgba(15,23,42,0.18);">
              <img src="https://contact-backend-v7b0.onrender.com/static/vansh-avatar.png" alt="Vansh avatar" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
            <div class="sig-text">
              <strong>Vansh Phalswal</strong><br />
              Cybersecurity &amp; Software Developer<br />
              contact@drkake.org
            </div>
          </div>

          <div class="footer">
            This is an automated confirmation email from my portfolio site.<br />
            © ${new Date().getFullYear()} Vansh Portfolio
          </div>
        </div>
      </div>
    </body>
  </html>
`;

app.post("/send-message", contactLimiter, async (req, res) => {
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

  // Save contact form entry to database
  await ContactMessage.create({ name, email, message });

  try {
    await resend.emails.send(mailToYou);
    await resend.emails.send(autoReply);

    res.json({ success: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// ⚠️ TEMP: Public admin messages endpoint (no auth yet)
// Later we can protect this with a key or login.
// ADMIN — get all messages
app.get("/admin/messages", async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, messages: msgs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

// ADMIN — delete a message
app.delete("/admin/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete message" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));