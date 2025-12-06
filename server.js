import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

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
    to: process.env.MAIL_USER,
    subject: `New message from ${name}`,
    text: `${message}\n\nEmail: ${email}`,
  };

  // Auto Reply to USER
  const autoReply = {
    from: "Vansh Portfolio <contact@drkake.org>",
    to: email,
    subject: "Thanks for contacting me!",
    text: `Hey ${name},\n\nThanks for reaching out! I received your message and will reply soon.\n\nRegards,\nVansh`,
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