"use client";

import { CanvasState, CANVAS_SIZES, FONT_CATEGORIES, CANVAS_THEMES } from "@/lib/canvas-types";

interface CanvasControlsProps {
  state: CanvasState;
  onChange: (updates: Partial<CanvasState>) => void;
}

export default function CanvasControls({ state, onChange }: CanvasControlsProps) {
  return (
    <div className="space-y-6">
      <Section title="Size">
        <div className="grid grid-cols-2 gap-2">
          {CANVAS_SIZES.map((size) => (
            <button
              key={size.label}
              onClick={() => onChange({ canvasWidth: size.width, canvasHeight: size.height })}
              className={`px-3 py-2 text-xs rounded-[var(--radius-sm)] border transition-colors ${
                state.canvasWidth === size.width && state.canvasHeight === size.height
                  ? "border-brand text-brand bg-brand-subtle"
                  : "border-border-subtle text-text-secondary hover:border-border-default"
              }`}
            >
              {size.label}
              <span className="block text-[10px] opacity-60 mt-0.5">{size.width}×{size.height}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Theme">
        <div className="grid grid-cols-4 gap-2">
          {CANVAS_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChange({
                background: theme.background,
                backgroundType: theme.backgroundType,
                textColor: theme.textColor,
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSize,
                lineHeight: theme.lineHeight,
                letterSpacing: theme.letterSpacing,
                overlay: theme.overlay,
                overlayOpacity: theme.overlayOpacity,
                showTitle: theme.showTitle,
                showAuthor: theme.showAuthor,
                showDivider: theme.showDivider,
                showBranding: theme.showBranding,
                position: theme.position,
                padding: theme.padding,
                themeId: theme.id,
              })}
              className={`aspect-square rounded-[var(--radius-sm)] border-2 transition-all flex items-end p-1.5 ${
                state.themeId === theme.id ? "border-brand scale-105" : "border-border-subtle hover:border-border-default"
              }`}
              title={theme.name}
            >
              <div
                className="w-full h-full rounded-[2px]"
                style={{
                  background: theme.backgroundType === "gradient" ? theme.background : theme.background,
                }}
              />
            </button>
          ))}
        </div>
      </Section>

      <Section title="Background">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["solid", "gradient", "image"] as const).map((type) => (
              <button
                key={type}
                onClick={() => onChange({ backgroundType: type })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                  state.backgroundType === type
                    ? "border-brand text-brand bg-brand-subtle"
                    : "border-border-subtle text-text-secondary hover:border-border-default"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {state.backgroundType === "solid" && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={state.background.startsWith("#") ? state.background : "#000000"}
                onChange={(e) => onChange({ background: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={state.background}
                onChange={(e) => onChange({ background: e.target.value })}
                className="flex-1 bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-brand"
                placeholder="#000000"
              />
            </div>
          )}

          {state.backgroundType === "gradient" && (
            <input
              type="text"
              value={state.background}
              onChange={(e) => onChange({ background: e.target.value })}
              className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-brand"
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          )}

          {state.backgroundType === "image" && (
            <div className="space-y-2">
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-border-subtle rounded-[var(--radius-sm)] text-xs text-text-tertiary hover:border-brand hover:text-brand transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onChange({ backgroundImage: ev.target?.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {state.backgroundImage ? "Replace image" : "Upload image"}
              </label>
              {state.backgroundImage && (
                <>
                  <Slider label="Blur" value={state.backgroundBlur} min={0} max={20} step={1} unit="px" onChange={(v) => onChange({ backgroundBlur: v })} />
                  <Slider label="Zoom" value={state.backgroundZoom} min={0.5} max={3} step={0.1} unit="×" onChange={(v) => onChange({ backgroundZoom: v })} />
                  <button onClick={() => onChange({ backgroundImage: "" })} className="text-xs text-error hover:text-error-hover transition-colors">Remove image</button>
                </>
              )}
            </div>
          )}
        </div>
      </Section>

      <Section title="Text Color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={state.textColor.startsWith("#") ? state.textColor : "#ffffff"}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <input
            type="text"
            value={state.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="flex-1 bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-brand"
          />
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3">
          <select
            value={state.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-xs text-text-primary outline-none focus:border-brand"
          >
            {Object.entries(FONT_CATEGORIES).map(([catKey, cat]) => (
              <optgroup key={catKey} label={`${cat.label} — ${cat.description}`}>
                {cat.fonts.map((font) => (
                  <option key={font.name} value={font.css}>{font.name}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <Slider label="Size" value={state.fontSize} min={16} max={120} step={1} unit="px" onChange={(v) => onChange({ fontSize: v })} />
          <Slider label="Weight" value={state.fontWeight} min={100} max={900} step={100} onChange={(v) => onChange({ fontWeight: v })} />
          <Slider label="Line height" value={state.lineHeight} min={1} max={3} step={0.05} onChange={(v) => onChange({ lineHeight: v })} />
          <Slider label="Letter spacing" value={state.letterSpacing} min={-0.05} max={0.2} step={0.005} onChange={(v) => onChange({ letterSpacing: v })} />
          <Slider label="Opacity" value={state.textOpacity} min={0} max={1} step={0.05} onChange={(v) => onChange({ textOpacity: v })} />
        </div>
      </Section>

      <Section title="Alignment">
        <div className="flex gap-1.5">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              onClick={() => onChange({ textAlign: align })}
              className={`flex-1 px-3 py-1.5 text-xs rounded-[var(--radius-sm)] border transition-colors capitalize ${
                state.textAlign === align
                  ? "border-brand text-brand bg-brand-subtle"
                  : "border-border-subtle text-text-secondary hover:border-border-default"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Position">
        <div className="flex gap-1.5">
          {(["top", "center", "bottom"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => onChange({ position: pos })}
              className={`flex-1 px-3 py-1.5 text-xs rounded-[var(--radius-sm)] border transition-colors capitalize ${
                state.position === pos
                  ? "border-brand text-brand bg-brand-subtle"
                  : "border-border-subtle text-text-secondary hover:border-border-default"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Padding">
        <Slider label="Padding" value={state.padding} min={20} max={200} step={5} unit="px" onChange={(v) => onChange({ padding: v })} />
      </Section>

      <Section title="Overlay">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.overlay && state.overlay !== "transparent" ? state.overlay : "#000000"}
              onChange={(e) => onChange({ overlay: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <button
              onClick={() => onChange({ overlay: "transparent", overlayOpacity: 0 })}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              Clear
            </button>
          </div>
          <Slider label="Overlay opacity" value={state.overlayOpacity} min={0} max={1} step={0.05} onChange={(v) => onChange({ overlayOpacity: v })} />
        </div>
      </Section>

      <Section title="Elements">
        <div className="space-y-2">
          <Toggle label="Show title" checked={state.showTitle} onChange={(v) => onChange({ showTitle: v })} />
          <Toggle label="Show author" checked={state.showAuthor} onChange={(v) => onChange({ showAuthor: v })} />
          <Toggle label="Show divider" checked={state.showDivider} onChange={(v) => onChange({ showDivider: v })} />
          <Toggle label="Show Poetly branding" checked={state.showBranding} onChange={(v) => onChange({ showBranding: v })} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-subtle pb-4">
      <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">{title}</p>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-tertiary w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 bg-border-subtle rounded-full appearance-none cursor-pointer accent-brand"
      />
      <span className="text-xs text-text-secondary w-12 text-right">{typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}{unit || ""}</span>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs text-text-secondary">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? "bg-brand" : "bg-border-default"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "left-[18px]" : "left-0.5"}`} />
      </div>
    </label>
  );
}
