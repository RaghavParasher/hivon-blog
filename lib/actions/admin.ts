"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    // 2. Verify Role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "Admin") {
      return { success: false, error: "Forbidden: Only Admins can perform this action." };
    }

    // 3. Delete Post
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    // 2. Verify Role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "Admin") {
      return { success: false, error: "Forbidden: Only Admins can perform this action." };
    }

    // 3. Delete Comment
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;

    revalidatePath(`/posts/${postId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return { success: false, error: error.message };
  }
}
