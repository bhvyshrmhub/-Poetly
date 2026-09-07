export interface Writer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  poemCount: number;
  followers: number;
  following: number;
  isFollowed?: boolean;
}

export interface Poem {
  id: string;
  title: string;
  content: string;
  author: Writer;
  createdAt: string;
  likes: number;
  comments: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
  mood?: string;
  tags?: string[];
  image?: string;
  responseTo?: string;
  collectionId?: string;
}

export interface Comment {
  id: string;
  author: Writer;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  author: Writer;
  poemCount: number;
  poems: Poem[];
  coverImage?: string;
}

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  participants: number;
  poems: Poem[];
  createdAt: string;
  isActive?: boolean;
}

export interface Mood {
  name: string;
  slug: string;
  color: string;
  icon: string;
}

export type TypographyStyle = "serif" | "sans" | "typewriter" | "handwritten";
export type Alignment = "left" | "center" | "right";
export type BackgroundStyle = "paper" | "dark" | "image";
