"use server";

import { supabase } from "@/lib/supabase";
import { generateSummary } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function createPost(formData: {
  title: string;
  body: string;
  image_url?: string;
  author_id: string;
}) {
  try {
    // 1. Insert the initial post into Supabase
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert([
        {
          title: formData.title,
          body: formData.body,
          image_url: formData.image_url,
          author_id: formData.author_id,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Generate AI summary in the background (or wait for it)
    // We wait for it here so we can update the record before returning
    const summary = await generateSummary(formData.body);

    if (summary) {
      // 3. Update the post with the summary
      const { error: updateError } = await supabase
        .from("posts")
        .update({ summary })
        .eq("id", post.id);

      if (updateError) {
        console.error("Failed to update post with summary:", updateError);
      }
    }

    // 4. Revalidate cache
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
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url,
      })
      .eq("id", postId);

    if (updateError) throw updateError;

    // Optional: Re-generate summary if body changed significantly
    const summary = await generateSummary(formData.body);
    if (summary) {
      await supabase.from("posts").update({ summary }).eq("id", postId);
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath(`/posts/${postId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in updatePost action:", error);
    return { success: false, error: error.message || "Failed to update post" };
  }
}
