"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const classes: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export default function Button({ variant = "primary", loading = false, disabled, children, ...rest }: Props) {
  return (
    <button className={classes[variant]} disabled={disabled || loading} {...rest}>
      {loading ? "Please wait…" : children}
    </button>
  );
}
