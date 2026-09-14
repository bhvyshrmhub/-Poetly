"use client";

import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Field({ label, error, id, ...rest }: Props) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] text-text-tertiary tracking-widest uppercase block mb-1.5">
        {label}
      </label>
      <input id={id} className="field-input" {...rest} />
      {error && <p className="text-xs text-error mt-1.5">{error}</p>}
    </div>
  );
}
