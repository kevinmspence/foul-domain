// pages/contact.js
import { useState, useRef } from 'react';
import Head from 'next/head';
import ReCAPTCHA from 'react-google-recaptcha';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const recaptchaRef = useRef();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Verifying...');

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    setStatus('Sending...');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken })
      });

      if (res.ok) {
        setStatus('Message sent!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to send message.');
      }
    } catch {
      setStatus('Error sending message.');
    }
  };

  return (
    <>
      <Head>
        <title>Contact | Foul Domain</title>
      </Head>
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-8 rounded shadow-lg w-full max-w-md space-y-4 border border-gray-700"
        >
          <h1 className="text-2xl font-bold mb-2">Contact Us</h1>

          <input
            name="name"
            type="text"
            required
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />

          <textarea
            name="message"
            required
            placeholder="Your Message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />

          <ReCAPTCHA
            sitekey="6Ld11lQrAAAAANODLzNEh54ncM_fSwqbix4COsZN"
            size="invisible"
            ref={recaptchaRef}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            Send
          </button>

          {status && <p className="text-sm text-center mt-2">{status}</p>}
        </form>
      </div>
    </>
  );
}

