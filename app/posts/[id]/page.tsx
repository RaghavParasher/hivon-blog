import { ArrowLeft, Clock, User, Share2, Sparkles, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CommentSection from "@/lib/components/CommentSection";
import { getComments } from "@/lib/actions/comments";
import PostActions from "@/lib/components/PostActions";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch Post Data
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      users (
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch Comments
  const comments = await getComments(id);

  return (
    <article style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to all stories
        </Link>
        <PostActions postId={id} authorId={post.author_id} />
      </div>

      <header style={{ marginBottom: '3rem' }}>
        <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: '24px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <img 
            src={post.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200"} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'white' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> {post.users?.name || "Anonymous Author"}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} /> {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{post.title}</h1>
        
        {post.summary && (
          <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(139, 92, 246, 0.05)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Sparkles className="text-gradient" style={{ marginTop: '0.2rem' }} />
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '0.5rem' }}>AI Summary</p>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--foreground)' }}>{post.summary}</p>
            </div>
          </div>
        )}
      </header>

      <div 
        className="post-content"
        style={{ 
          fontSize: '1.2rem', 
          lineHeight: '1.8', 
          color: 'rgba(255,255,255,0.85)',
          marginBottom: '5rem'
        }}
      >
        {post.body.split('\n').map((para: string, i: number) => (
          <p key={i} style={{ marginBottom: '1.5rem' }}>{para}</p>
        ))}
      </div>

      <CommentSection postId={id} initialComments={comments} />
    </article>
  );
}
