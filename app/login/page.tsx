"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, MoveRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Redirect to home or dashboard after successful login
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    setError(null);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      // 1. Try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (!signInError) {
        router.push("/");
        router.refresh();
        return;
      }

      // 2. If it failed due to invalid credentials, register the demo user on-the-fly
      if (signInError.message.includes("Invalid login credentials") || signInError.status === 400) {
        console.log(`Demo account ${demoEmail} not found. Registering on-the-fly...`);
        const nameMap: Record<string, string> = {
          'admin@hivon.com': 'Demo Admin',
          'author@hivon.com': 'Demo Author',
          'viewer@hivon.com': 'Demo Viewer',
        };
        const demoName = nameMap[demoEmail] || 'Demo User';

        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: {
              full_name: demoName,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Try to sign in again after registering
        const { error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });

        if (retrySignInError) throw retrySignInError;

        router.push("/");
        router.refresh();
      } else {
        throw signInError;
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', width: '100%' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to home
      </Link>
      
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Sign in to your account to continue.</p>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem 0.75rem 3rem', 
                  borderRadius: '8px', 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'white',
                  outline: 'none',
                  opacity: loading ? 0.7 : 1
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem 0.75rem 3rem', 
                  borderRadius: '8px', 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'white',
                  outline: 'none',
                  opacity: loading ? 0.7 : 1
                }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ 
              justifyContent: 'center', 
              marginTop: '1rem',
              opacity: loading ? 0.8 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                Signing in... <Loader2 size={18} className="animate-spin" />
              </>
            ) : (
              <>
                Sign In <MoveRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Quick Demo Access (One-Click)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button 
              type="button"
              onClick={() => handleDemoLogin('admin@hivon.com', 'Password123!')}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.25rem', fontSize: '0.8rem', justifyContent: 'center', width: '100%' }}
            >
              Admin
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('author@hivon.com', 'Password123!')}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.25rem', fontSize: '0.8rem', justifyContent: 'center', width: '100%' }}
            >
              Author
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('viewer@hivon.com', 'Password123!')}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.25rem', fontSize: '0.8rem', justifyContent: 'center', width: '100%' }}
            >
              Viewer
            </button>
          </div>
        </div>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
