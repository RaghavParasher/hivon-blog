"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
  try {
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
