"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { Trash2, MessageSquare, FileText, User as UserIcon, Loader2, ExternalLink } from "lucide-react";
import { deletePost, deleteComment } from "@/lib/actions/admin";
import Link from "next/link";

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Posts
    const { data: postsData } = await supabase
      .from("posts")
      .select(`*, users(name)`)
      .order("created_at", { ascending: false });
    
    // Fetch Comments
    const { data: commentsData } = await supabase
      .from("comments")
      .select(`*, users(name), posts(title)`)
      .order("created_at", { ascending: false });

    setPosts(postsData || []);
    setComments(commentsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      const result = await deletePost(id);
      if (result.success) {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        alert(result.error);
      }
    }
  };

  const handleDeleteComment = async (id: string, postId: string) => {
    if (confirm("Delete this comment?")) {
      const result = await deleteComment(id, postId);
      if (result.success) {
        setComments(comments.filter(c => c.id !== id));
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <header>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Admin Dashboard</h1>
          <p className="text-muted">Manage all site content, users, and discussions.</p>
        </header>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('posts')}
            style={{ 
              padding: '1rem 2rem', 
              background: 'none', 
              color: activeTab === 'posts' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'posts' ? '2px solid var(--primary)' : 'none',
              fontWeight: '600'
            }}
          >
            Posts ({posts.length})
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            style={{ 
              padding: '1rem 2rem', 
              background: 'none', 
              color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : 'none',
              fontWeight: '600'
            }}
          >
            Comments ({comments.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : (
          <div>
            {activeTab === 'posts' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.map(post => (
                  <div key={post.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{post.title}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }} className="text-muted">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UserIcon size={14} /> {post.users?.name}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/posts/${post.id}`} className="btn-secondary" style={{ padding: '0.5rem' }}>
                        <ExternalLink size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="btn-secondary" 
                        style={{ padding: '0.5rem', color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map(comment => (
                  <div key={comment.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ marginBottom: '0.5rem' }}>"{comment.comment_text}"</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }} className="text-muted">
                        <span style={{ fontWeight: '600' }}>{comment.users?.name}</span>
                        <span>on <Link href={`/posts/${comment.post_id}`} style={{ color: 'var(--primary)' }}>{comment.posts?.title}</Link></span>
                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteComment(comment.id, comment.post_id)}
                      className="btn-secondary" 
                      style={{ padding: '0.5rem', color: '#ef4444' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
