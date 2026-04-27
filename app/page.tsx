import Link from "next/link";
import { MoveRight, Sparkles, Clock, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
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

      {/* Featured Posts */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>Latest Stories</h2>
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
                  {post.summary}
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
    </div>
  );
}
