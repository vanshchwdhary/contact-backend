import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const MAIL_TO = process.env.MAIL_TO;
const app = express();
app.use(cors());
app.use(express.json());

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
          <img src="https://i.ibb.co/0GJ9t1z/vp-logo.png" alt="VP Logo" />
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

const htmlTemplate = (name) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email</title>

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
          <img src="https://i.ibb.co/0GJ9t1z/vp-logo.png" alt="VP Logo" />
        </div>

        <h2>Thanks for reaching out!</h2>

        <p>Hi ${name},</p>

        <p>
          Thank you for contacting me! I’ve received your message and will get back to you soon.
        </p>

        <p>Warm regards,<br /><strong>Vansh</strong></p>

        <div class="footer">© ${new Date().getFullYear()} Vansh Portfolio</div>
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
    html: htmlTemplate(name),
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