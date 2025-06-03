// pages/api/contact.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end(); // Only allow POST

  const { name, email, message, recaptchaToken } = req.body;
  console.log('📩 Incoming request:', req.body);

  if (!name || !email || !message || !recaptchaToken) {
    console.warn('⚠️ Missing one or more required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // ✅ Verify reCAPTCHA token
  try {
    const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      console.warn('❌ reCAPTCHA failed:', verifyData);
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }
  } catch (err) {
    console.error('reCAPTCHA verification error:', err);
    return res.status(500).json({ error: 'reCAPTCHA verification failed' });
  }

  // ✅ Send email via SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Change if using another provider
      port: 587,
      secure: false,
      auth: {
        user: process.env.CONTACT_EMAIL_USER,
        pass: process.env.CONTACT_EMAIL_PASS.replace(/^'|'$/g, '') // Strip quotes if needed
      }
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.CONTACT_EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL_TO,
      subject: `Foul Domain Contact Form - from ${name}`,
      text: `${message}\n\nReply to: ${email}`,
      replyTo: email
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('📪 Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
