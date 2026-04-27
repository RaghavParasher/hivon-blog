"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { Edit3, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePost } from "@/lib/actions/admin";

interface PostActionsProps {
  postId: string;
  authorId: string;
}

export default function PostActions({ postId, authorId }: PostActionsProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const canEdit = user && (user.id === authorId || profile?.role === 'Admin');

  if (!canEdit) return null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      setDeleting(true);
      const result = await deletePost(postId);
      if (result.success) {
        router.push("/posts");
      } else {
        alert(result.error);
        setDeleting(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Link 
        href={`/posts/${postId}/edit`} 
        className="btn-secondary" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <Edit3 size={16} /> Edit
      </Link>
      <button 
        onClick={handleDelete}
        disabled={deleting}
        className="btn-secondary" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}
      >
        {deleting ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Delete</>}
      </button>
    </div>
  );
}
