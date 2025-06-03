// pages/contact.js
import { useState, useRef } from 'react';
import Head from 'next/head';
import ReCAPTCHA from 'react-google-recaptcha';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [sent, setSent] = useState(false);
  const recaptchaRef = useRef();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Verifying...');

    try {
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();

      setStatus('Sending...');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken })
      });

      if (res.ok) {
        setStatus('Thanks for reaching out!');
        setSent(true);
      } else {
        const data = await res.json();
        setStatus(data.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus('Error sending message.');
    }
  };

  return (
    <>
      <Head>
        <title>Contact | Foul Domain</title>
      </Head>
      <div
        className="min-h-screen bg-black bg-cover bg-center text-white flex items-center justify-center px-4 py-12"
        style={{
          backgroundImage: "url('/backgrounds/contact.png')",
        }}
      >
        <div className="bg-gray-900 bg-opacity-90 p-8 rounded shadow-lg w-full max-w-md border border-gray-700 space-y-4 text-center">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h1 className="text-2xl font-bold mb-2">Contact Me!</h1>
              <p>Hi! I&rsquo;m Kevin. I&rsquo;m not on social, so reach out here.</p>

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
            </form>
          ) : (
            <div className="text-green-400 text-xl font-semibold pt-4 pb-8">
              🎉 Thanks for reaching out! We&rsquo;ll be in touch soon.
            </div>
          )}

          {status && (
            <p className="text-sm text-gray-400 mt-2">{status}</p>
          )}
        </div>
      </div>
    </>
  );
}
