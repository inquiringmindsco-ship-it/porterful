'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-gray-400">
            Questions? Ideas? Want to partner? We're all ears.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center border border-[#ff6b00]/30">
            <div className="text-6xl mb-4">✉️</div>
            <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
            <p className="text-gray-400 mb-6">
              We'll get back to you within 24-48 hours.
            </p>
            <Link 
              href="/" 
              className="text-[#ff6b00] hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
              >
                <option value="">Select a topic</option>
                <option value="artist">I'm an artist interested in joining</option>
                <option value="business">I'm a business wanting to list products</option>
                <option value="brand">Brand partnership inquiry</option>
                <option value="support">Customer support</option>
                <option value="press">Press / Media</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors resize-none"
                placeholder="Tell us more..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff6b00] text-white py-3 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors"
            >
              Send Message
            </button>

            <p className="text-center text-gray-500 text-sm">
              Or email us directly at{' '}
              <a href="mailto:hello@porterful.com" className="text-[#ff6b00] hover:underline">
                hello@porterful.com
              </a>
            </p>
          </form>
        )}

        {/* Quick Links */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-gray-800">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold mb-1">Help Center</h3>
            <p className="text-gray-500 text-sm">FAQs and guides</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-gray-800">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold mb-1">Community</h3>
            <p className="text-gray-500 text-sm">Join our Discord</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-gray-800">
            <div className="text-3xl mb-2">🐦</div>
            <h3 className="font-semibold mb-1">Twitter</h3>
            <p className="text-gray-500 text-sm">@porterful</p>
          </div>
        </div>
      </div>
    </div>
  );
}