'use client';

import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react';

const FEATURED_POST = {
  id: 'artist-retirement-plan',
  title: 'The Artist Retirement Plan: Why We Built Porterful',
  excerpt: 'Most artists don\'t have a 401(k). They don\'t get royalties from streaming. They tour until they can\'t. We\'re building something different.',
  author: 'O D Porter',
  date: 'March 20, 2026',
  readTime: '5 min read',
  category: 'Mission',
  image: null,
};

const POSTS = [
  {
    id: 'superfan-economy',
    title: 'The Superfan Economy: How Fans Earn While Supporting Artists',
    excerpt: 'What if every time you shared an artist\'s merch, you got a cut? That\'s the superfan layer—and it changes everything.',
    author: 'O D Porter',
    date: 'March 18, 2026',
    readTime: '4 min read',
    category: 'Features',
  },
  {
    id: 'four-sided-marketplace',
    title: 'Why We\'re a Four-Sided Marketplace (Not Another Bandcamp)',
    excerpt: 'Artists, superfans, businesses, and brands. Each side feeds the other. Here\'s how the flywheel works.',
    author: 'O D Porter',
    date: 'March 15, 2026',
    readTime: '6 min read',
    category: 'Business',
  },
  {
    id: 'proud-to-pay',
    title: 'Proud to Pay: The End of "Music Should Be Free"',
    excerpt: 'We asked 1,000 fans what they\'d pay if they knew 100% went to the artist. The answer surprised us.',
    author: 'O D Porter',
    date: 'March 12, 2026',
    readTime: '3 min read',
    category: 'Research',
  },
  {
    id: 'launch-announcement',
    title: 'Porterful Launches: A New Kind of Music Platform',
    excerpt: 'After two years of building, we\'re live. Here\'s what we\'ve built, why we built it, and what comes next.',
    author: 'O D Porter',
    date: 'March 10, 2026',
    readTime: '4 min read',
    category: 'Announcement',
  },
];

const CATEGORIES = ['All', 'Mission', 'Features', 'Business', 'Research', 'Announcement'];

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-4">
            <Tag size={14} />
            BLOG
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Building the Artist Economy
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Updates, insights, and stories from the team building a platform where artists own everything.
          </p>
        </div>

        {/* Featured Post */}
        <div className="pf-card mb-12 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-video md:aspect-auto bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-6xl">
              🚀
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] text-xs font-bold rounded">
                  FEATURED
                </span>
                <span className="text-sm text-[var(--pf-text-muted)]">{FEATURED_POST.category}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 hover:text-[var(--pf-orange)] transition-colors">
                <Link href={`/blog/${FEATURED_POST.id}`}>
                  {FEATURED_POST.title}
                </Link>
              </h2>
              <p className="text-[var(--pf-text-secondary)] mb-6">
                {FEATURED_POST.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-[var(--pf-text-muted)]">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {FEATURED_POST.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {FEATURED_POST.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {FEATURED_POST.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === 'All'
                  ? 'bg-[var(--pf-orange)] text-white'
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-hover)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post) => (
            <article key={post.id} className="pf-card group hover:border-[var(--pf-orange)]/50 transition-colors">
              <div className="aspect-video bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center text-4xl">
                📰
              </div>
              <div className="p-6">
                <span className="text-xs text-[var(--pf-orange)] font-bold uppercase tracking-wider">
                  {post.category}
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-3 group-hover:text-[var(--pf-orange)] transition-colors">
                  <Link href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-sm text-[var(--pf-text-secondary)] line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--pf-text-muted)]">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 pf-card p-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.1)_0%,transparent_60%)]" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Get updates on new features, artist stories, and platform announcements.
            </p>
            <form className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              />
              <button type="submit" className="pf-btn pf-btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Press Kit */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Press & Media</h2>
          <p className="text-[var(--pf-text-secondary)] mb-6 max-w-xl mx-auto">
            Journalists, bloggers, and podcasters — we'd love to talk. Download our press kit or reach out directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/press-kit" 
              className="pf-btn pf-btn-secondary"
            >
              Download Press Kit
            </a>
            <a
              href="/contact"
              className="pf-btn pf-btn-secondary"
            >
              Contact Press Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
