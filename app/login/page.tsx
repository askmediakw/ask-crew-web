import { redirect } from 'next/navigation'

// The canonical login route is now /auth/login. Keep this legacy path working
// by redirecting to it.
export default function LegacyLoginPage() {
  redirect('/auth/login')
}
