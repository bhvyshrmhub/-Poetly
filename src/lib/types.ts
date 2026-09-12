import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Poem = Database["public"]["Tables"]["poems"]["Row"];
export type PoemInsert = Database["public"]["Tables"]["poems"]["Insert"];
export type PoemUpdate = Database["public"]["Tables"]["poems"]["Update"];

export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type LikeInsert = Database["public"]["Tables"]["likes"]["Insert"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];

export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type FollowInsert = Database["public"]["Tables"]["follows"]["Insert"];

export type Save = Database["public"]["Tables"]["saves"]["Row"];
export type SaveInsert = Database["public"]["Tables"]["saves"]["Insert"];

export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];

export type CollectionPoem = Database["public"]["Tables"]["collection_poems"]["Row"];

export type Response = Database["public"]["Tables"]["responses"]["Row"];

export type Prompt = Database["public"]["Tables"]["prompts"]["Row"] & {
  prompt_text?: string | null;
  image_url?: string | null;
  mood?: string | null;
  tags?: string[] | null;
  status?: "upcoming" | "active" | "ended";
  start_date?: string | null;
  end_date?: string | null;
};

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type Report = Database["public"]["Tables"]["reports"]["Row"];

// Extended types with joins
export type PoemWithAuthor = Poem & {
  profiles: Profile;
};

export type PoemWithDetails = Poem & {
  profiles: Profile;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
};

export type CommentWithAuthor = Comment & {
  profiles: Profile;
};

export type NotificationWithActor = Notification & {
  profiles: Profile | null;
};

export type WriterWithStats = Profile & {
  followerCount: number;
  followingCount: number;
  poemCount: number;
  isFollowed: boolean;
};
