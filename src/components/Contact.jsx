/* Contact.jsx ------------------------------------------------ */
import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CONTACT_INFO = [
  {
    icon: PhoneIcon,
    title: 'Phone',
    value: '+91 9315804493',
    link: 'tel:+919315804493',
    description: 'Mon-Fri 9am to 6pm'
  },
  {
    icon: EnvelopeIcon,
    title: 'Email',
    value: 'support@nayaysutra.in',
    link: 'mailto:support@nayaysutra.in',
    description: 'We reply within 24 hours'
  },
  {
    icon: MapPinIcon,
    title: 'Office',
    value: 'Delhi, India',
    link: '#',
    description: 'Visit us at our office'
  },
  {
    icon: ClockIcon,
    title: 'Working Hours',
    value: 'Mon - Sat',
    link: '#',
    description: '9:00 AM - 6:00 PM'
  }
];

const FAQs = [
  {
    q: 'How quickly will I receive a response?',
    a: 'We typically respond to all inquiries within 24 hours during business days.'
  },
  {
    q: 'What types of legal issues can you help with?',
    a: 'We assist with family law, property disputes, consumer rights, employment issues, and more.'
  },
  {
    q: 'Is the consultation free?',
    a: 'Initial consultations are free. We\'ll discuss fees for any ongoing legal assistance.'
  }
];

export default function Contact() {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState(null);
  const [formData, setFormData] = useState({
    from_name: '',
    reply_to: '',
    phone: '',
    subject: '',
    message: ''
  });

  // EmailJS Configuration
  const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // Admin notification template
  const AUTO_REPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID; // Auto-reply template
  const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'Wcnqo7RHvXyKfzHfk';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendAutoReply = async (userEmail, userName) => {
    const autoReplyParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'Nayay Sutra Support',
      reply_to: 'support@nayaysutra.in',
      message: `
Dear ${userName},

Thank you for contacting Nayay Sutra. We have received your message and appreciate you reaching out to us.

Our team will review your inquiry and respond within 24 hours during business days (Monday-Saturday, 9:00 AM - 6:00 PM IST).

In the meantime:
• For urgent legal matters, call us at +91 9315804493
• Browse our FAQ section at www.nayaysutra.in/faq
• Join our community forum for peer support

What happens next?
1. Our legal expert will review your query
2. We'll assess how we can best assist you
3. You'll receive a detailed response via email

If you need immediate assistance, please don't hesitate to call our helpline.

Best regards,
Nayay Sutra Legal Support Team

---
This is an automated response. Please do not reply to this email.
      `.trim()
    };

    try {
      await emailjs.send(
        SERVICE_ID,
        AUTO_REPLY_TEMPLATE_ID,
        autoReplyParams,
        PUBLIC_KEY
      );
      console.log('Auto-reply sent successfully');
    } catch (error) {
      console.error('Auto-reply failed:', error);
      // Don't show error to user as main message was sent
    }
  };

  const sendMail = async (e) => {
    e.preventDefault();
    if (sending) return;
    
    setSending(true);
    setBanner(null);

    try {
      // Send main notification to admin
      const result = await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
        publicKey: PUBLIC_KEY,
      });

      if (result.text === 'OK') {
        // Send auto-reply to user
        await sendAutoReply(formData.reply_to, formData.from_name);
        
        setBanner({ 
          type: 'success', 
          text: 'Message sent successfully! Check your email for confirmation. We\'ll respond within 24 hours.' 
        });
        
        setFormData({
          from_name: '',
          reply_to: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (err) {
      console.error(err);
      setBanner({
        type: 'error',
        text: 'Failed to send message. Please try again or email us directly.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div id='contactus1' className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Have questions? We're here to help and answer any question you might have.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 -mt-20">
          {CONTACT_INFO.map((info, idx) => (
            <a
              key={idx}
              href={info.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                <info.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {info.title}
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                {info.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {info.description}
              </p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Fill out the form below and you'll receive an automated confirmation email immediately.
              </p>

              {/* Banner */}
              {banner && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    banner.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  }`}
                >
                  {banner.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span>{banner.text}</span>
                </div>
              )}

              <form ref={formRef} onSubmit={sendMail} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      name="from_name"
                      type="text"
                      required
                      value={formData.from_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      name="reply_to"
                      type="email"
                      required
                      value={formData.reply_to}
                      onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="6"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                          fill="none"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                {FAQs.map((faq, idx) => (
                  <details key={idx} className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      <span className="font-medium text-gray-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="p-4 text-gray-600 dark:text-gray-300">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Need immediate help?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Our support team is available during business hours to assist you.
                </p>
                <a
                  href="tel:+911800123456"
                  className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call +91 1800-123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}