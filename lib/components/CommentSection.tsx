"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { addComment } from "@/lib/actions/comments";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
  initialComments: any[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await addComment({
        post_id: postId,
        user_id: user.id,
        comment_text: commentText,
      });

      if (result.success) {
        setCommentText("");
      } else {
        setError(result.error || "Failed to post comment");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MessageSquare size={28} className="text-muted" /> Discussion
        </h2>
        <span className="text-muted">{initialComments.length} Comments</span>
      </div>

      {/* Add Comment Form */}
      <div className="glass-card" style={{ marginBottom: '3rem' }}>
        {user ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white' }}>
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{profile?.name || user.email?.split('@')[0]}</span>
            </div>
            
            <textarea 
              placeholder="What are your thoughts?" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              style={{ 
                width: '100%', 
                minHeight: '100px',
                padding: '1rem', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--glass-border)', 
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                resize: 'none'
              }}
              required
            />

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting || !commentText.trim()}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Post Comment <Send size={16} style={{ marginLeft: '0.5rem' }} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p className="text-muted">
              You must be <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>logged in</Link> to join the conversation.
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {initialComments.length > 0 ? (
          initialComments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: '1.5rem', animation: 'fadeIn 0.5s ease forwards' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} className="text-muted" />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>{comment.users?.name || 'Anonymous User'}</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted" style={{ lineHeight: '1.6' }}>{comment.comment_text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </section>
  );
}
