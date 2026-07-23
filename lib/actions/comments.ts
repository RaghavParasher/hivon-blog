"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(formData: {
  post_id: string;
  comment_text: string;
  user_id?: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    // 2. Insert Comment using caller's verified user_id
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: formData.post_id,
          user_id: user.id, // Enforce authenticated user id
          comment_text: formData.comment_text,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/posts/${formData.post_id}`);
    return { success: true, comment: data };
  } catch (error: any) {
    console.error("Error in addComment action:", error);
    return { success: false, error: error.message || "Failed to add comment" };
  }
}

export async function getComments(postId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users (
          name
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}
