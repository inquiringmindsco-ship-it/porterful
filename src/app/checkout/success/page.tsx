import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from 'next-auth';

export default async function CheckoutSuccessPage() {
  redirect('https://porterful.com/checkout/checkout/success');
}
