import { supabase } from "./client";

export async function uploadImage(
  file: File,
  bucket: "avatars" | "poem-images",
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const maxSizeBytes = bucket === "avatars" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { url: null, error: `Image must be smaller than ${bucket === "avatars" ? "5MB" : "10MB"}.` };
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { url: null, error: "Only JPG, PNG, WebP, or GIF images are supported." };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err instanceof Error ? err.message : "Failed to upload image." };
  }
}
