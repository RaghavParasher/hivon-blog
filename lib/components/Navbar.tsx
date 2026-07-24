"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LogOut, User as UserIcon, PlusCircle, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/" className="logo">
          Chronicle AI
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          
          {user ? (
            <>
              {(profile?.role === 'Author' || profile?.role === 'Admin') && (
                <Link href="/create" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PlusCircle size={16} /> Create
                </Link>
              )}
              
              {profile?.role === 'Admin' && (
                <Link href="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: '500' }}>
                    <UserIcon size={16} />
                    <span>{profile?.name || user.email?.split('@')[0]}</span>
                  </div>
                  <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', marginTop: '0.2rem', background: profile?.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)', color: profile?.role === 'Admin' ? '#ef4444' : 'var(--primary)' }}>
                    {profile?.role || 'Viewer'}
                  </span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
