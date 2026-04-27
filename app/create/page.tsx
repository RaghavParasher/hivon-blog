"use client";

import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { Sparkles, Send, Image as ImageIcon, Type, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createPost } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";

import ImageUpload from "@/lib/components/ImageUpload";

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPublishing(true);
    setError(null);

    try {
      const result = await createPost({
        title,
        body: content,
        image_url: imageUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200",
        author_id: user.id,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/posts/${result.postId}`);
        }, 2000);
      } else {
        setError(result.error || "Failed to publish post");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setPublishing(false);
    }
  };

  if (success) {
    return (
      <ProtectedRoute allowedRoles={['Author', 'Admin']}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '2rem', borderRadius: '50%', color: '#22c55e' }}>
            <CheckCircle2 size={64} className="animate-bounce" />
          </div>
          <h1 style={{ fontSize: '2.5rem' }}>Story Published!</h1>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>Gemini AI has finished generating your summary. Redirecting you to your post...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Author', 'Admin']}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Create New Story</h1>
          <p className="text-muted">Draft your thoughts and let Gemini AI generate a perfect summary for you.</p>
        </header>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Type size={18} className="text-primary" /> Story Title
              </label>
              <input 
                type="text" 
                placeholder="Enter a catchy title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={publishing}
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'white',
                  fontSize: '1.2rem',
                  outline: 'none',
                  opacity: publishing ? 0.7 : 1
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={18} className="text-primary" /> Cover Image
              </label>
              <ImageUpload onUpload={(url) => setImageUrl(url)} currentUrl={imageUrl} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '1rem', fontWeight: '600' }}>Your Story</label>
              <textarea 
                placeholder="Write your masterpiece here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={publishing}
                style={{ 
                  width: '100%', 
                  minHeight: '300px',
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'white',
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'vertical',
                  opacity: publishing ? 0.7 : 1
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn-secondary" disabled={publishing}>Save Draft</button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={publishing}
              style={{ padding: '0.75rem 2rem', opacity: publishing ? 0.8 : 1 }}
            >
              {publishing ? (
                <>
                  AI is Summarizing... <Loader2 size={18} className="animate-spin" style={{ marginLeft: '0.5rem' }} />
                </>
              ) : (
                <>
                  Publish with AI Summary <Sparkles size={18} style={{ marginLeft: '0.5rem' }} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
