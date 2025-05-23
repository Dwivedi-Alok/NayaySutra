/* Contact.jsx ------------------------------------------------ */
import React, { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const formRef      = useRef(null)
  const [sending, setSending] = useState(false)
  const [banner,  setBanner]  = useState(null)   // { type:'success'|'error', text:'' }

  /* ---------- ENV keys (safer than hard-coding) ---------- */
  const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  const sendMail = async e => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setBanner(null)

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
        publicKey: 'Wcnqo7RHvXyKfzHfk',
      })
      setBanner({ type: 'success', text: '🎉 Message sent! We will reply soon.' })
      formRef.current.reset()
    } catch (err) {
      console.error(err)
      setBanner({
        type: 'error',
        text: '❌ Oops, something went wrong. Please try again later.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg bg-white shadow rounded p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>

        {/* Feedback banner */}
        {banner && (
          <div
            className={`mb-6 px-4 py-3 rounded text-sm ${
              banner.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {banner.text}
          </div>
        )}

        <form ref={formRef} onSubmit={sendMail} className="space-y-4">
          <input
            name="from_name"
            type="text"
            required
            placeholder="Your Name"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="reply_to"
            type="email"
            required
            placeholder="Your E-mail"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="subject"
            type="text"
            required
            placeholder="Subject"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="message"
            rows="5"
            required
            placeholder="Your message…"
            className="w-full border rounded px-3 py-2"
          />

          <button
            disabled={sending}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center"
          >
            {sending && (
              <svg
                className="animate-spin mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z"
                ></path>
              </svg>
            )}
            {sending ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        {/* Optional extra info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Prefer e-mail? Write to&nbsp;
          <a
            href="mailto:alok78555@gmail.com"
            className="text-blue-600 hover:underline"
          >
            support@nayaysutra.in
          </a>
        </div>
      </div>
    </div>
  )
}