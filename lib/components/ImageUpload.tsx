"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export default function ImageUpload({ onUpload, currentUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("images") // Assuming bucket name is 'images'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    onUpload("");
  };

  return (
    <div style={{ width: '100%' }}>
      {preview ? (
        <div style={{ position: 'relative', width: '100%', height: '250px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            onClick={removeImage}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '250px', 
          border: '2px dashed var(--glass-border)', 
          borderRadius: '12px', 
          cursor: 'pointer',
          gap: '1rem',
          transition: 'all 0.2s ease'
        }}
        className="hover-scale"
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-primary" />
              <span className="text-muted">Uploading image...</span>
            </>
          ) : (
            <>
              <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '50%' }}>
                <ImageIcon size={32} className="text-muted" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600' }}>Click to upload cover image</p>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>PNG, JPG, or WEBP (max. 5MB)</p>
              </div>
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </>
          )}
        </label>
      )}
    </div>
  );
}
