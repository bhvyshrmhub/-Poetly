export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          profile_image: string | null;
          website: string | null;
          location: string | null;
          status: "active" | "suspended" | "banned";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          profile_image?: string | null;
          website?: string | null;
          location?: string | null;
          status?: "active" | "suspended" | "banned";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          profile_image?: string | null;
          website?: string | null;
          location?: string | null;
          status?: "active" | "suspended" | "banned";
          created_at?: string;
          updated_at?: string;
        };
      };
      poems: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          mood: string | null;
          tags: string[] | null;
          image_url: string | null;
          visibility: "public" | "private" | "unlisted";
          status: "draft" | "published" | "archived" | "hidden" | "removed";
          response_to: string | null;
          prompt_id: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          mood?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          visibility?: "public" | "private" | "unlisted";
          status?: "draft" | "published" | "archived" | "hidden" | "removed";
          response_to?: string | null;
          prompt_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          mood?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          visibility?: "public" | "private" | "unlisted";
          status?: "draft" | "published" | "archived" | "hidden" | "removed";
          response_to?: string | null;
          prompt_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          poem_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poem_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poem_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          poem_id: string;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          poem_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          poem_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          poem_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poem_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poem_id?: string;
          created_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_poems: {
        Row: {
          id: string;
          collection_id: string;
          poem_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          poem_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          poem_id?: string;
          created_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          original_poem_id: string;
          response_poem_id: string;
          author_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          original_poem_id: string;
          response_poem_id: string;
          author_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          original_poem_id?: string;
          response_poem_id?: string;
          author_id?: string;
          created_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string | null;
          type: "like" | "comment" | "follow" | "response" | "mention";
          reference_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id?: string | null;
          type: "like" | "comment" | "follow" | "response" | "mention";
          reference_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          actor_id?: string | null;
          type?: "like" | "comment" | "follow" | "response" | "mention";
          reference_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: "poem" | "comment" | "user";
          target_id: string;
          reason: string;
          report_category: string | null;
          status: "pending" | "reviewed" | "resolved" | "dismissed";
          admin_note: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: "poem" | "comment" | "user";
          target_id: string;
          reason: string;
          report_category?: string | null;
          status?: "pending";
          admin_note?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: "poem" | "comment" | "user";
          target_id?: string;
          reason?: string;
          report_category?: string | null;
          status?: "pending" | "reviewed" | "resolved" | "dismissed";
          admin_note?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "moderator";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: "admin" | "moderator";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin" | "moderator";
          created_at?: string;
        };
      };
      featured_content: {
        Row: {
          id: string;
          content_type: "poem" | "prompt" | "collection";
          content_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_type: "poem" | "prompt" | "collection";
          content_id: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_type?: "poem" | "prompt" | "collection";
          content_id?: string;
          position?: number;
          created_at?: string;
        };
      };
      admin_activity_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
