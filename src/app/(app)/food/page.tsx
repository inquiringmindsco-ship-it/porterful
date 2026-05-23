'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UtensilsCrossed } from 'lucide-react'

// Mock restaurant data with real food images
const RESTAURANTS = [
  {
    id: '1',
    name: 'Southern Kitchen',
    dish: 'Jambalaya Plate',
    description: 'Authentic Cajun jambalaya with shrimp and andouille sausage',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    cuisine: 'Cajun',
    rating: 4.8,
    distance: '0.3 mi',
    discount: '20% OFF',
    creator: 'O D Porter',
  },
  {
    id: '2',
    name: 'Burger Joint',
    dish: 'Smash Burger Deluxe',
    description: 'Double smashed patties, cheddar, pickles, special sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    cuisine: 'American',
    rating: 4.6,
    distance: '0.5 mi',
    discount: null,
    creator: 'O D Porter',
  },
  {
    id: '3',
    name: 'Pho Paradise',
    dish: 'Beef Pho Bowl',
    description: 'Slow-cooked beef broth, rice noodles, fresh herbs',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
    cuisine: 'Vietnamese',
    rating: 4.9,
    distance: '0.8 mi',
    discount: 'Free Drink',
    creator: 'O D Porter',
  },
  {
    id: '4',
    name: 'Taco Loco',
    dish: 'Birria Tacos (3pc)',
    description: 'Slow-braised beef in consommé, melted cheese, onions',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=600&q=80',
    cuisine: 'Mexican',
    rating: 4.7,
    distance: '1.2 mi',
    discount: '15% OFF',
    creator: 'O D Porter',
  },
  {
    id: '5',
    name: 'Wok This Way',
    dish: 'Kung Pao Chicken',
    description: 'Spicy chicken, peanuts, vegetables, chili peppers',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80',
    cuisine: 'Chinese',
    rating: 4.5,
    distance: '0.9 mi',
    discount: null,
    creator: 'O D Porter',
  },
  {
    id: '6',
    name: 'Soul Food Spot',
    dish: 'Fried Chicken & Waffles',
    description: 'Crispy fried chicken, fluffy waffles, maple syrup',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
    cuisine: 'Soul Food',
    rating: 4.9,
    distance: '1.5 mi',
    discount: '25% OFF',
    creator: 'O D Porter',
  },
]

type SwipeDirection = 'left' | 'right' | null

function DishCard({ restaurant, onSwipe, isTop, offsetX = 0 }: {
  restaurant: typeof RESTAURANTS[0]
  onSwipe: (dir: SwipeDirection) => void
  isTop: boolean
  offsetX?: number
}) {
  const [startX, setStartX] = useState(0)
  const [currentOffset, setCurrentOffset] = useState(offsetX)
  const [opacity, setOpacity] = useState(1)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTop) return
    const diff = e.touches[0].clientX - startX
    setCurrentOffset(diff)
    setOpacity(Math.max(0.3, 1 - Math.abs(diff) / 300))
  }

  const handleTouchEnd = () => {
    if (!isTop) return
    if (currentOffset > 80) {
      setCurrentOffset(300)
      setOpacity(0)
      setTimeout(() => onSwipe('right'), 150)
    } else if (currentOffset < -80) {
      setCurrentOffset(-300)
      setOpacity(0)
      setTimeout(() => onSwipe('left'), 150)
    } else {
      setCurrentOffset(0)
      setOpacity(1)
    }
  }

  const rotate = currentOffset / 10
  const showMatch = currentOffset > 40
  const showNope = currentOffset < -40

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${currentOffset}px) rotate(${rotate}deg)`,
        opacity,
        transition: isTop ? 'none' : 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-[var(--pf-surface)]">
        <Image
          src={restaurant.image}
          alt={restaurant.dish}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Discount badge */}
        {restaurant.discount && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-[var(--pf-orange)] text-white text-xs font-bold rounded-full shadow-lg">
            {restaurant.discount}
          </div>
        )}

        {/* Creator badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
          by {restaurant.creator}
        </div>

        {/* Dish info - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{restaurant.dish}</h2>
              <p className="text-white/70 text-sm mb-2">{restaurant.name} · {restaurant.cuisine}</p>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 text-sm font-medium">★ {restaurant.rating}</span>
                <span className="text-white/50 text-sm">{restaurant.distance}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${restaurant.price}</div>
            </div>
          </div>
        </div>

        {/* Swipe indicators */}
        {showMatch && (
          <div className="absolute top-8 left-8 px-4 py-2 border-4 border-green-500 rounded-xl rotate-[-15deg]">
            <span className="text-green-500 font-black text-2xl">MATCH</span>
          </div>
        )}
        {showNope && (
          <div className="absolute top-8 right-8 px-4 py-2 border-4 border-red-500 rounded-xl rotate-[15deg]">
            <span className="text-red-500 font-black text-2xl">NOPE</span>
          </div>
        )}
      </div>
    </div>
  )
}

function UnlockedCard({ restaurant, onClose }: {
  restaurant: typeof RESTAURANTS[0]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--pf-surface)] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
        <div className="relative h-48">
          <Image src={restaurant.image} alt={restaurant.dish} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
            ✓ Unlocked
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-1">{restaurant.dish}</h3>
          <p className="text-[var(--pf-text-secondary)] text-sm mb-4">{restaurant.name}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">★</span>
              <span>{restaurant.rating} rating</span>
              <span className="text-[var(--pf-text-muted)]">·</span>
              <span>{restaurant.distance}</span>
            </div>
            <p className="text-[var(--pf-text-secondary)] text-sm">{restaurant.description}</p>
          </div>

          {restaurant.discount && (
            <div className="bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-xl p-3 mb-6 text-center">
              <span className="text-[var(--pf-orange)] font-bold">{restaurant.discount}</span>
              <span className="text-[var(--pf-text-secondary)] text-sm ml-2">with this swipe</span>
            </div>
          )}

          <div className="space-y-3">
            <button className="w-full py-3 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors">
              Get Directions
            </button>
            <button onClick={onClose} className="w-full py-3 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)] font-medium rounded-xl hover:border-[var(--pf-orange)] transition-colors">
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FoodPage() {
  const [stack, setStack] = useState(RESTAURANTS.slice(0, 3))
  const [swiped, setSwiped] = useState<typeof RESTAURANTS[0][]>([])
  const [unlocked, setUnlocked] = useState<typeof RESTAURANTS[0] | null>(null)

  const handleSwipe = (direction: SwipeDirection, restaurant: typeof RESTAURANTS[0]) => {
    if (direction === 'right') {
      setUnlocked(restaurant)
    }
    setSwiped(prev => [...prev, restaurant])

    // Load next card
    const currentIndex = RESTAURANTS.findIndex(r => r.id === restaurant.id)
    const nextIndex = currentIndex + 1
    if (nextIndex < RESTAURANTS.length) {
      setStack(prev => [...prev.slice(1), RESTAURANTS[nextIndex]])
    } else {
      setStack(prev => prev.slice(1))
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 px-4 py-2 text-center">
        <p className="text-white text-sm font-bold">🚨 Coming Soon — Real restaurants near you</p>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--pf-orange)] via-orange-500 to-[var(--pf-orange)] px-4 py-6 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hunger Swipes</h1>
            <p className="text-white/70 text-sm">Swipe right to unlock · Left to skip</p>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{swiped.length} / {RESTAURANTS.length}</div>
            <div className="text-white/50 text-xs">swiped</div>
          </div>
        </div>
      </div>

      {/* Swipe Stack */}
      <div className="px-4 pt-6">
        <div className="relative h-[55vh] max-w-sm mx-auto">
          {stack.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex justify-center text-[var(--pf-orange)]">
                <UtensilsCrossed className="h-16 w-16" />
              </div>
              <h2 className="text-xl font-bold mb-2">All out of food!</h2>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-6">Check back soon for more delicious options</p>
              <button
                onClick={() => { setStack(RESTAURANTS.slice(0, 3)); setSwiped([]) }}
                className="px-6 py-3 bg-[var(--pf-orange)] text-white font-medium rounded-xl"
              >
                Start Over
              </button>
            </div>
          ) : (
            stack.map((restaurant, i) => (
              <DishCard
                key={restaurant.id}
                restaurant={restaurant}
                isTop={i === 0}
                onSwipe={(dir) => handleSwipe(dir, restaurant)}
              />
            )).reverse()
          )}
        </div>

        {/* Action Buttons */}
        {stack.length > 0 && (
          <div className="flex justify-center items-center gap-6 mt-6 max-w-sm mx-auto">
            {/* Skip / Swipe Left */}
            <button
              onClick={() => handleSwipe('left', stack[0])}
              className="w-14 h-14 rounded-full bg-[var(--pf-surface)] border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg"
              title="Skip"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Heart / Swipe Right */}
            <button
              onClick={() => handleSwipe('right', stack[0])}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-xl"
              title="Unlock"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="px-4 mt-12">
        <h2 className="text-xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { step: '1', title: 'Swipe', desc: 'Browse meals visually. Right to unlock, left to skip.' },
            { step: '2', title: 'Unlock', desc: 'See the restaurant, location, and exclusive discount.' },
            { step: '3', title: 'Eat', desc: 'Visit or order. Your creator earns when you buy.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 bg-[var(--pf-orange)] rounded-full flex items-center justify-center text-white font-bold">{item.step}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-[var(--pf-text-secondary)] text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How Creators & Restaurants Earn */}
      <div className="px-4 mt-12">
        <h2 className="text-2xl font-bold mb-2 text-center">How Everyone Gets Paid</h2>
        <p className="text-[var(--pf-text-secondary)] text-sm text-center mb-8 max-w-md mx-auto">
          Hunger Swipes turns food discovery into a revenue stream for creators and restaurants.
        </p>

        {/* For Creators */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-orange-500/5 rounded-2xl p-6 border border-[var(--pf-orange)]/20 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[var(--pf-orange)]/20 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-orange)]"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">For Creators (Artists)</h3>
              <p className="text-[var(--pf-text-secondary)] text-xs">You recommend restaurants you love</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 font-bold">$4</span>
              <span className="text-[var(--pf-text-secondary)]">earned when a fan swipes right and visits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 font-bold">3%</span>
              <span className="text-[var(--pf-text-secondary)]">of every order your fans place</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 font-bold">Passive</span>
              <span className="text-[var(--pf-text-secondary)]">income — eat, share, earn</span>
            </div>
          </div>
        </div>

        {/* For Restaurants */}
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-2xl p-6 border border-purple-500/20 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M3 2l2.5 18.5A2 2 0 0 0 7.5 22h9a2 2 0 0 0 1.9-1.5L21 2"/><path d="M12 11V7"/><path d="M8 7h8"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">For Restaurants</h3>
              <p className="text-[var(--pf-text-secondary)] text-xs">Get customers through artist recommendations</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-purple-400 font-bold">$0</span>
              <span className="text-[var(--pf-text-secondary)]">upfront cost to join</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-purple-400 font-bold">$4-10</span>
              <span className="text-[var(--pf-text-secondary)]">per confirmed visit (vs $20+ for ads)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-purple-400 font-bold">Real</span>
              <span className="text-[var(--pf-text-secondary)]">customers who actually show up</span>
            </div>
          </div>
        </div>

        {/* The Math */}
        <div className="bg-[var(--pf-bg-secondary)] rounded-2xl p-6 border border-[var(--pf-border)]">
          <h3 className="font-bold mb-4 text-center">The Numbers</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--pf-orange)]">100</div>
              <div className="text-xs text-[var(--pf-text-muted)]">fans see your pick</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--pf-orange)]">10%</div>
              <div className="text-xs text-[var(--pf-text-muted)]">swipe right</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">$40+</div>
              <div className="text-xs text-[var(--pf-text-muted)]">you earn per dish</div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant CTA */}
      <div className="px-4 mt-12 mb-6">
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-6 border border-[var(--pf-orange)]/20 text-center">
          <h3 className="font-bold mb-2">Own a Restaurant?</h3>
          <p className="text-[var(--pf-text-secondary)] text-sm mb-4">Join Porterful and get discovered by fans through their favorite artists.</p>
          <button className="px-6 py-2 bg-[var(--pf-orange)] text-white text-sm font-medium rounded-xl">
            Apply to Partner
          </button>
        </div>
      </div>

      {/* Unlocked Modal */}
      {unlocked && (
        <UnlockedCard restaurant={unlocked} onClose={() => setUnlocked(null)} />
      )}
    </div>
  )
}
