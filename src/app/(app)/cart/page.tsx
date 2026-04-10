import { redirect } from 'next/navigation'

export default function CartPage() {
  // Cart lives at /cart/cart — this prevents double-nesting issues
  redirect('/cart/cart')
}
