export type CanvasSize = {
  label: string;
  width: number;
  height: number;
};

export type CanvasPosition = "top" | "center" | "bottom";

export type CanvasTheme = {
  id: string;
  name: string;
  background: string;
  backgroundType: "solid" | "gradient";
  textColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  overlay: string;
  overlayOpacity: number;
  showTitle: boolean;
  showAuthor: boolean;
  showDivider: boolean;
  showBranding: boolean;
  position: CanvasPosition;
  padding: number;
};

export type CanvasState = {
  poemTitle: string;
  poemContent: string;
  authorName: string;
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  backgroundType: "solid" | "gradient" | "image";
  backgroundImage: string;
  backgroundBlur: number;
  backgroundZoom: number;
  backgroundPosition: string;
  overlay: string;
  overlayOpacity: number;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textOpacity: number;
  textAlign: "left" | "center" | "right";
  position: CanvasPosition;
  padding: number;
  showTitle: boolean;
  showAuthor: boolean;
  showDivider: boolean;
  showBranding: boolean;
  themeId: string;
};

export const CANVAS_SIZES: CanvasSize[] = [
  { label: "Square", width: 1080, height: 1080 },
  { label: "Portrait", width: 1080, height: 1350 },
  { label: "Story", width: 1080, height: 1920 },
  { label: "Landscape", width: 1920, height: 1080 },
];

export const FONT_CATEGORIES = {
  serif: {
    label: "Serif",
    description: "Elegant / literary",
    fonts: [
      { name: "Cormorant Garamond", css: "'Cormorant Garamond', Georgia, serif" },
      { name: "DM Serif Display", css: "'DM Serif Display', Georgia, serif" },
      { name: "Playfair Display", css: "'Playfair Display', Georgia, serif" },
      { name: "Lora", css: "'Lora', Georgia, serif" },
      { name: "Merriweather", css: "'Merriweather', Georgia, serif" },
    ],
  },
  sans: {
    label: "Sans",
    description: "Modern / minimal",
    fonts: [
      { name: "Inter", css: "'Inter', sans-serif" },
      { name: "Work Sans", css: "'Work Sans', sans-serif" },
      { name: "Outfit", css: "'Outfit', sans-serif" },
      { name: "Plus Jakarta Sans", css: "'Plus Jakarta Sans', sans-serif" },
    ],
  },
  display: {
    label: "Display",
    description: "Artistic / expressive",
    fonts: [
      { name: "Playfair Display", css: "'Playfair Display', serif" },
      { name: "Libre Baskerville", css: "'Libre Baskerville', serif" },
      { name: "Crimson Text", css: "'Crimson Text', serif" },
    ],
  },
  mono: {
    label: "Mono",
    description: "Typewriter / experimental",
    fonts: [
      { name: "JetBrains Mono", css: "'JetBrains Mono', monospace" },
      { name: "Fira Code", css: "'Fira Code', monospace" },
      { name: "Space Mono", css: "'Space Mono', monospace" },
    ],
  },
};

export const CANVAS_THEMES: CanvasTheme[] = [
  {
    id: "midnight",
    name: "Midnight",
    background: "#0f0f1a",
    backgroundType: "solid",
    textColor: "#e8eaf0",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 48,
    lineHeight: 1.8,
    letterSpacing: 0.01,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: true,
    showBranding: true,
    position: "center",
    padding: 80,
  },
  {
    id: "paper",
    name: "Paper",
    background: "#faf8f5",
    backgroundType: "solid",
    textColor: "#2a2a2a",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 44,
    lineHeight: 1.9,
    letterSpacing: 0.005,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: false,
    showBranding: true,
    position: "center",
    padding: 80,
  },
  {
    id: "minimal",
    name: "Minimal",
    background: "#ffffff",
    backgroundType: "solid",
    textColor: "#1a1a1a",
    fontFamily: "'Inter', sans-serif",
    fontSize: 36,
    lineHeight: 1.8,
    letterSpacing: 0.02,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: false,
    showAuthor: true,
    showDivider: false,
    showBranding: false,
    position: "center",
    padding: 100,
  },
  {
    id: "moon",
    name: "Moon",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    backgroundType: "gradient",
    textColor: "#d4d4d4",
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: 52,
    lineHeight: 1.7,
    letterSpacing: 0,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: true,
    showBranding: true,
    position: "center",
    padding: 80,
  },
  {
    id: "vintage",
    name: "Vintage",
    background: "#f5e6d3",
    backgroundType: "solid",
    textColor: "#5c4033",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 42,
    lineHeight: 1.85,
    letterSpacing: 0.005,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: true,
    showBranding: true,
    position: "center",
    padding: 80,
  },
  {
    id: "romantic",
    name: "Romantic",
    background: "linear-gradient(135deg, #2d1b33 0%, #1a1a2e 50%, #2d1b33 100%)",
    backgroundType: "gradient",
    textColor: "#e89ac7",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 46,
    lineHeight: 1.8,
    letterSpacing: 0.01,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: true,
    showBranding: true,
    position: "center",
    padding: 80,
  },
  {
    id: "mono",
    name: "Mono",
    background: "#1a1a1a",
    backgroundType: "solid",
    textColor: "#00ff88",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 32,
    lineHeight: 1.8,
    letterSpacing: 0.03,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: false,
    showBranding: false,
    position: "center",
    padding: 80,
  },
  {
    id: "ink",
    name: "Ink",
    background: "#f0ede8",
    backgroundType: "solid",
    textColor: "#1a1a1a",
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 40,
    lineHeight: 1.9,
    letterSpacing: 0.005,
    overlay: "transparent",
    overlayOpacity: 0,
    showTitle: true,
    showAuthor: true,
    showDivider: true,
    showBranding: true,
    position: "center",
    padding: 90,
  },
];

export function getDefaultCanvasState(poemTitle: string, poemContent: string, authorName: string): CanvasState {
  const theme = CANVAS_THEMES[0];
  return {
    poemTitle,
    poemContent,
    authorName,
    canvasWidth: 1080,
    canvasHeight: 1080,
    background: theme.background,
    backgroundType: theme.backgroundType,
    backgroundImage: "",
    backgroundBlur: 0,
    backgroundZoom: 1,
    backgroundPosition: "center",
    overlay: theme.overlay,
    overlayOpacity: theme.overlayOpacity,
    textColor: theme.textColor,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
    fontWeight: 400,
    lineHeight: theme.lineHeight,
    letterSpacing: theme.letterSpacing,
    textOpacity: 1,
    textAlign: "center",
    position: theme.position,
    padding: theme.padding,
    showTitle: theme.showTitle,
    showAuthor: theme.showAuthor,
    showDivider: theme.showDivider,
    showBranding: theme.showBranding,
    themeId: theme.id,
  };
}
