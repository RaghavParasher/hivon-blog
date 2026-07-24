"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { generateSummary } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function createPost(formData: {
  title: string;
  body: string;
  image_url?: string;
  author_id?: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    // 2. Verify Role (Author or Admin)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || (profile.role !== "Author" && profile.role !== "Admin")) {
      return { success: false, error: "Forbidden: Only Authors or Admins can create posts." };
    }

    // 3. Insert Post
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert([
        {
          title: formData.title,
          body: formData.body,
          image_url: formData.image_url,
          author_id: user.id, // Enforce logged-in user as author
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Retrieve session access token to run background database updates safely
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    // Create a static client with headers so it does not touch dynamic Next.js cookies outside request context
    const bgSupabase = accessToken
      ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        })
      : supabase;

    // 5. Generate AI Summary asynchronously in the background (non-blocking)
    generateSummary(formData.body).then(async (summary) => {
      if (summary) {
        const { error: updateError } = await bgSupabase
          .from("posts")
          .update({ summary })
          .eq("id", post.id);

        if (updateError) {
          console.error("Database update error for AI summary:", updateError);
        } else {
          // Revalidate cache to display summary immediately on next load
          revalidatePath(`/posts/${post.id}`);
          revalidatePath("/posts");
          revalidatePath("/");
        }
      }
    }).catch(err => {
      console.error("Error generating AI summary in background:", err);
    });

    revalidatePath("/");
    revalidatePath("/posts");

    return { success: true, postId: post.id };
  } catch (error: any) {
    console.error("Error in createPost action:", error);
    return { success: false, error: error.message || "Failed to create post" };
  }
}

export async function updatePost(postId: string, formData: {
  title: string;
  body: string;
  image_url?: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    // 2. Fetch Post Author and User Role
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return { success: false, error: "Post not found." };
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Check if author or Admin
    if (post.author_id !== user.id && (!profile || profile.role !== "Admin")) {
      return { success: false, error: "Forbidden: You do not have permission to edit this post." };
    }

    // 3. Update Post
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url,
      })
      .eq("id", postId);

    if (updateError) throw updateError;

    // 4. Update Summary asynchronously in the background (non-blocking)
    generateSummary(formData.body).then(async (summary) => {
      if (summary && !summary.startsWith("[AI Error")) {
        const serverSupabase = await createClient();
        await serverSupabase
          .from("posts")
          .update({ summary })
          .eq("id", postId);
      }
    }).catch(err => {
      console.error("Error updating AI summary in background:", err);
    });

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath(`/posts/${postId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in updatePost action:", error);
    return { success: false, error: error.message || "Failed to update post" };
  }
}
