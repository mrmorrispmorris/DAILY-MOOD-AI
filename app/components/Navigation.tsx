'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase-client'

export default function Navigation() {
  const router = useRouter()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="navigation">
      <Link href="/dashboard" className="nav-link">Dashboard</Link>
      <Link href="/analytics" className="nav-link">Analytics</Link>
      <Link href="/settings" className="nav-link">Settings</Link>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </nav>
  )
}

