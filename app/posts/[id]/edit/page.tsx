"use client";

import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { Sparkles, Save, Image as ImageIcon, Type, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updatePost } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/lib/components/ImageUpload";
import Link from "next/link";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setError("Post not found");
        setLoading(false);
        return;
      }

      // Authorization check
      if (user && data.author_id !== user.id && profile?.role !== 'Admin') {
        router.push("/");
        return;
      }

      setTitle(data.title);
      setContent(data.body);
      setImageUrl(data.image_url || "");
      setLoading(false);
    };

    if (user) {
      fetchPost();
    }
  }, [params.id, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await updatePost(params.id, {
        title,
        body: content,
        image_url: imageUrl,
      });

      if (result.success) {
        router.push(`/posts/${params.id}`);
      } else {
        setError(result.error || "Failed to update post");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Author', 'Admin']}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href={`/posts/${params.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Cancel and back to post
        </Link>

        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Edit Story</h1>
          <p className="text-muted">Update your thoughts. Gemini AI will re-generate the summary if needed.</p>
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
                disabled={saving}
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'white',
                  fontSize: '1.2rem',
                  outline: 'none',
                  opacity: saving ? 0.7 : 1
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
                disabled={saving}
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
                  opacity: saving ? 0.7 : 1
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={saving}
              style={{ padding: '0.75rem 2rem', opacity: saving ? 0.8 : 1 }}
            >
              {saving ? (
                <>
                  Saving Changes... <Loader2 size={18} className="animate-spin" style={{ marginLeft: '0.5rem' }} />
                </>
              ) : (
                <>
                  Save Changes <Save size={18} style={{ marginLeft: '0.5rem' }} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
