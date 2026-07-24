import Link from "next/link";
import { MoveRight, Sparkles, Clock, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch latest 3 posts from Supabase
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      users (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching latest posts:", error);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
        <div className="badge" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
          <Sparkles size={14} />
          Powered by Google Gemini 2.0
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
          Share Your Stories with the <span className="text-gradient">Power of AI</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>
          The next generation blogging platform for creators. Write your thoughts, and let our AI generate beautiful summaries for your readers.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/create" className="btn-primary">
            Start Writing <MoveRight size={18} />
          </Link>
          <Link href="/posts" className="btn-secondary">
            Explore Posts
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Powering the Future of Blogging</h2>
          <p className="text-muted">A collection of premium features engineered for creators and readers alike.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AI Summarization</h3>
            <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Instantly generate clean, engaging summaries of your articles using Google Gemini, helping readers grasp your story in seconds.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Role-Based Access</h3>
            <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Secure workspace routing with strict permissions for Admins, Authors, and Viewers to safeguard your creation environment.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Futuristic Design</h3>
            <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Enjoy a gorgeous glassmorphic interface built with modern dark mode tokens, smooth transitions, and premium responsive layouts.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem' }}>Latest Stories</h2>
            <p className="text-muted">Fresh insights from our growing community</p>
          </div>
          <Link href="/posts" style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem' }}>
            View All Posts
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img 
                    src={post.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800"} 
                    alt={post.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={14} /> {post.users?.name || "Anonymous"}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.5rem' }}>{post.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', flexGrow: 1 }}>
                  {post.summary || "No summary available."}
                </p>
                <Link href={`/posts/${post.id}`} style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Read Full Story <MoveRight size={16} />
                </Link>
              </article>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }} className="glass-card">
              <p className="text-muted">No stories published yet. Be the first to share your thoughts!</p>
              <Link href="/create" className="text-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Create a post now</Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="glass-card" style={{ padding: '3.5rem', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-around', textAlign: 'center', background: 'rgba(139, 92, 246, 0.03)' }}>
        <div>
          <h3 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0 }}>15K+</h3>
          <p style={{ fontWeight: '500', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Active Readers</p>
        </div>
        <div>
          <h3 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0 }}>5K+</h3>
          <p style={{ fontWeight: '500', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Stories Published</p>
        </div>
        <div>
          <h3 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0 }}>99.9%</h3>
          <p style={{ fontWeight: '500', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Cloud Uptime</p>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="glass-card" style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto', width: '100%', background: 'rgba(255, 255, 255, 0.01)' }}>
        <h2 style={{ fontSize: '2.25rem', margin: 0 }}>Subscribe to the Chronicle</h2>
        <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Get weekly summaries of the best tech and creative stories delivered straight to your inbox.
        </p>
        <form style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', width: '100%', margin: '1.5rem auto 0' }}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            required 
            style={{
              flexGrow: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
          <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
