'use client';

import Link from 'next/link';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-[#ff6b00] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mt-4">DMCA & Copyright</h1>
          <p className="text-gray-400 mt-2">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Digital Millennium Copyright Act</h2>
            <p className="text-gray-300">
              Porterful respects the intellectual property rights of others and expects users to do the same. We will promptly respond to notices of alleged copyright infringement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Submitting a DMCA Notice</h2>
            <p className="text-gray-300 mb-4">
              If you believe your copyrighted work has been copied in a way that constitutes copyright infringement, please provide us with:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
              <li>A physical or electronic signature of the copyright owner or authorized agent</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing</li>
              <li>Your contact information (address, phone, email)</li>
              <li>A statement of good faith belief that the use is not authorized</li>
              <li>A statement, under penalty of perjury, that the information is accurate</li>
            </ul>
            <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-lg p-4">
              <p className="text-gray-300">
                <strong className="text-[#ff6b00]">Note:</strong> False DMCA claims can result in legal liability. Only submit if you genuinely believe the content infringes your copyright.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">DMCA Counter-Notice</h2>
            <p className="text-gray-300 mb-4">
              If you believe your content was removed by mistake, you may submit a counter-notice including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Your physical or electronic signature</li>
              <li>Identification of the removed content and its location before removal</li>
              <li>A statement under penalty of perjury that you believe it was removed by mistake</li>
              <li>Your name, address, and phone number</li>
              <li>Consent to the jurisdiction of the federal court in your district</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">What We Do</h2>
            <p className="text-gray-300 mb-4">
              When we receive a valid DMCA notice, we will:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Remove or disable access to the allegedly infringing content</li>
              <li>Notify the user who posted the content</li>
              <li>Forward the notice to the alleged infringer</li>
              <li>Terminate accounts that repeatedly infringe copyrights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Repeat Infringers</h2>
            <p className="text-gray-300">
              Porterful maintains a policy of terminating, in appropriate circumstances, accounts of users who repeatedly infringe the intellectual property rights of others.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p className="text-gray-300 mb-4">
              To submit a DMCA notice or counter-notice:
            </p>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <p className="text-gray-300">
                📧 <a href="mailto:dmca@porterful.com" className="text-[#ff6b00] hover:underline">dmca@porterful.com</a>
              </p>
              <p className="text-gray-300 mt-3">
                📍 Porterful, Inc.<br />
                Attn: Copyright Agent<br />
                4240 Duncan Ave, Suite 200<br />
                St. Louis, MO 63110
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Trademark Policy</h2>
            <p className="text-gray-300">
              Porterful, the Porterful logo, and related marks are trademarks of Porterful, Inc. Other brand names and logos appearing on the Platform are the property of their respective owners. Use of any trademarks without prior written consent is prohibited.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            This DMCA Policy is effective as of March 2026 and complies with the Digital Millennium Copyright Act.
          </p>
        </div>
      </div>
    </div>
  );
}
