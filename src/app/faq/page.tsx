'use client';

import Link from 'next/link';

export default function FAQPage() {
  const categories = [
    {
      title: 'For Artists',
      faqs: [
        { q: 'How much do I earn from my merch?', a: 'You keep 80% of every sale. The remaining 20% covers payment processing (15%) and our platform fee (5%). No hidden fees.' },
        { q: 'How do I get paid?', a: 'Payments are processed via Stripe. You can withdraw anytime with a $10 minimum. Payments typically arrive in 2-3 business days.' },
        { q: 'Can I use a dropship supplier?', a: 'Yes! We integrate with Printful, Zendrop, and CJ Dropshipping. You can also self-fulfill if you prefer.' },
        { q: 'Do I earn from marketplace purchases?', a: 'Yes! When your superfans shop marketplace items from other businesses, you earn a share. That\'s the Porterful difference.' },
        { q: 'How do referrals work for artists?', a: 'Share your artist page link. When fans sign up through it, they become your superfans. Their purchases generate income for you.' },
      ]
    },
    {
      title: 'For Superfans',
      faqs: [
        { q: 'What is a Superfan?', a: 'A Superfan is someone who supports artists by sharing their work. When people shop through your referral code, you earn a percentage.' },
        { q: 'How much can I earn?', a: '5% on artist merch, 3% on marketplace items. There\'s no cap—the more you share, the more you earn.' },
        { q: 'Do I need to buy anything first?', a: 'No. You can start earning immediately. Just sign up, get your code, and share.' },
        { q: 'How long does a referral last?', a: '30 days. When someone uses your code, their purchases count for you for 30 days.' },
        { q: 'How do I cash out?', a: 'Connect your Stripe account and withdraw anytime. Minimum withdrawal is $10.' },
      ]
    },
    {
      title: 'For Businesses',
      faqs: [
        { q: 'Why list on Porterful?', a: 'Reach a passionate audience of music fans. Artists promote products they love, driving organic sales.' },
        { q: 'What can I sell?', a: 'Any product that aligns with our community—apparel, accessories, home goods, tech, and more. No counterfeits or unauthorized merch.' },
        { q: 'What\'s the fee structure?', a: '67% to you, 20% to artists (split among referring artists), 3% to superfans, 10% to Porterful. Win-win for everyone.' },
        { q: 'How do I get started?', a: 'Sign up as a Business, upload products, and set your prices. Artists discover and share products they love.' },
      ]
    },
    {
      title: 'For Brands',
      faqs: [
        { q: 'How do brand sponsorships work?', a: 'Partner with artists for authentic endorsements. Campaigns, sponsored content, and co-branded merchandise.' },
        { q: 'What\'s the cost?', a: 'Varies by artist reach and campaign scope. Contact us for custom pricing.' },
        { q: 'How do I ensure authenticity?', a: 'We match brands with artists who genuinely love their products. No forced endorsements.' },
      ]
    },
    {
      title: 'General',
      faqs: [
        { q: 'Is Porterful free to join?', a: 'Yes, completely free. No monthly fees, no setup costs. You only pay fees when you sell.' },
        { q: 'What payment methods do you accept?', a: 'Credit/debit cards, Apple Pay, Google Pay, PayPal, and buy-now-pay-later options.' },
        { q: 'Is my data safe?', a: 'We never sell your data. Artists only see aggregated stats, never individual customer info.' },
        { q: 'How do I contact support?', a: 'Email support@porterful.com or use our contact form. Response time is typically under 24 hours.' },
        { q: 'Can I sell internationally?', a: 'Yes. Porterful supports worldwide shipping. Buyers see prices in their local currency.' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400">Everything you need to know about Porterful</p>
        </div>

        {categories.map((category, i) => (
          <div key={i} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-[#ff6b00]">{category.title}</h2>
            <div className="space-y-4">
              {category.faqs.map((faq, j) => (
                <details key={j} className="group bg-[#1a1a1a] rounded-lg border border-gray-800">
                  <summary className="cursor-pointer p-4 font-semibold flex justify-between items-center">
                    {faq.q}
                    <span className="text-[#ff6b00] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-gray-400">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <Link 
            href="/contact" 
            className="inline-block bg-[#ff6b00] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}