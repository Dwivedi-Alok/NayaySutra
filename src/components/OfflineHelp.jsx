/* OfflineHelp.jsx -------------------------------------------------- */
import React, { useState } from 'react'

export default function OfflineHelp() {
  const [phone, setPhone]     = useState('')
  const [loading, setLoad]    = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState(null)

  const isValidPhone = p => /^\+?\d{10,15}$/.test(p)

  const requestHelp = async () => {
    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number with country code.')
      return
    }
    setError(null)
    setLoad(true)
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error('Server responded with ' + res.status)
      setSent(true)
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Please try again later.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        SMS & Voice Help (Offline Mode)
      </h2>

      {!sent ? (
        <>
          {error && (
            <p className="mb-3 text-red-600 text-sm text-center">{error}</p>
          )}
          <input
            type="tel"
            value={phone}
            disabled={loading}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. +919876543210"
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <button
            onClick={requestHelp}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center"
          >
            {loading && (
              <svg
                className="animate-spin mr-2 h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z"
                />
              </svg>
            )}
            {loading ? 'Sending…' : 'Request Call / SMS'}
          </button>
        </>
      ) : (
        <p className="text-center text-green-700 font-semibold">
          Thank you! You will receive a call / SMS shortly.
        </p>
      )}
    </div>
  )
}