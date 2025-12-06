import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }

  const mailToYou = {
    from: email,
    to: process.env.MAIL_USER,
    subject: `New message from ${name}`,
    text: `${message}\n\nEmail: ${email}`,
  };

  const autoReply = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Thanks for contacting me!",
    text: `Hey ${name},\n\nThanks for reaching out! I received your message and will reply soon.\n\nRegards,\nVansh`,
  };

  try {
    await transporter.sendMail(mailToYou);
    await transporter.sendMail(autoReply);
    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
