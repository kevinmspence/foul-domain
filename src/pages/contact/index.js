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
        body: JSON.stringify({ ...formData, recaptchaToken }),
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

      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono px-4 py-24">
        <div className="max-w-md mx-auto border border-gray-700 rounded-md p-6 sm:p-8 bg-gray-900 space-y-6 text-center">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h1 className="text-3xl font-semibold uppercase tracking-widest">Contact</h1>
              <p className="text-sm text-gray-400">
                Hi! I’m Kevin. I’m not on social, so reach out here.
              </p>

              <input
                name="name"
                type="text"
                required
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-sm"
              />

              <input
                name="email"
                type="email"
                required
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-sm"
              />

              <textarea
                name="message"
                required
                placeholder="Your Message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-sm"
              />

              <ReCAPTCHA
                sitekey="6Ld11lQrAAAAANODLzNEh54ncM_fSwqbix4COsZN"
                size="invisible"
                ref={recaptchaRef}
              />

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded text-sm transition"
              >
                Send
              </button>
            </form>
          ) : (
            <div className="text-green-400 text-lg font-semibold pt-4 pb-8">
              🎉 Thanks for reaching out! I’ll be in touch soon.
            </div>
          )}

          {status && <p className="text-sm text-gray-400">{status}</p>}
        </div>
      </main>
    </>
  );
}
