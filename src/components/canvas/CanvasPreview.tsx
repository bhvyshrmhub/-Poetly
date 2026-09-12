"use client";

import { CanvasState } from "@/lib/canvas-types";

interface CanvasPreviewProps {
  state: CanvasState;
  scale?: number;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export default function CanvasPreview({ state, scale = 0.4, previewRef }: CanvasPreviewProps) {
  return (
    <div
      ref={previewRef}
      data-canvas-preview
      style={{
        width: state.canvasWidth,
        height: state.canvasHeight,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        position: "absolute",
        top: 0,
        left: 0,
        background: state.backgroundType === "image" ? "#000" : state.background,
        backgroundImage: state.backgroundType === "gradient" ? state.background : undefined,
        overflow: "hidden",
        fontFamily: state.fontFamily,
      }}
    >
      {state.backgroundType === "image" && state.backgroundImage && (
        <img
          src={state.backgroundImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: state.backgroundBlur > 0 ? `blur(${state.backgroundBlur}px)` : undefined,
            transform: state.backgroundZoom !== 1 ? `scale(${state.backgroundZoom})` : undefined,
          }}
        />
      )}

      {state.overlay && state.overlay !== "transparent" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: state.overlay,
            opacity: state.overlayOpacity,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: state.position === "top" ? "flex-start" : state.position === "bottom" ? "flex-end" : "center",
          padding: state.padding,
          opacity: state.textOpacity,
        }}
      >
        {state.showTitle && state.poemTitle && (
          <h2
            style={{
              fontFamily: state.fontFamily,
              fontSize: Math.max(24, state.fontSize * 0.55),
              fontWeight: 600,
              color: state.textColor,
              textAlign: state.textAlign,
              marginBottom: 24,
              lineHeight: 1.3,
              letterSpacing: state.letterSpacing,
              opacity: 0.9,
            }}
          >
            {state.poemTitle}
          </h2>
        )}

        {state.showDivider && (
          <div
            style={{
              width: 40,
              height: 2,
              background: state.textColor,
              opacity: 0.3,
              marginBottom: 24,
              alignSelf: state.textAlign === "center" ? "center" : state.textAlign === "right" ? "flex-end" : "flex-start",
            }}
          />
        )}

        <div
          style={{
            fontFamily: state.fontFamily,
            fontSize: state.fontSize,
            fontWeight: state.fontWeight,
            lineHeight: state.lineHeight,
            letterSpacing: state.letterSpacing,
            color: state.textColor,
            textAlign: state.textAlign,
            whiteSpace: "pre-line",
            maxWidth: "80%",
            alignSelf: state.textAlign === "center" ? "center" : state.textAlign === "right" ? "flex-end" : "flex-start",
          }}
        >
          {state.poemContent}
        </div>

        {state.showAuthor && (
          <p
            style={{
              fontFamily: state.fontFamily,
              fontSize: Math.max(16, state.fontSize * 0.38),
              color: state.textColor,
              textAlign: state.textAlign,
              marginTop: 32,
              opacity: 0.6,
              fontStyle: "italic",
              alignSelf: state.textAlign === "center" ? "center" : state.textAlign === "right" ? "flex-end" : "flex-start",
            }}
          >
            — {state.authorName}
          </p>
        )}

        {state.showBranding && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: state.textColor,
              textAlign: state.textAlign,
              marginTop: 16,
              opacity: 0.3,
              letterSpacing: 0.1,
              textTransform: "uppercase",
              alignSelf: state.textAlign === "center" ? "center" : state.textAlign === "right" ? "flex-end" : "flex-start",
            }}
          >
            Poetly
          </p>
        )}
      </div>
    </div>
  );
}
