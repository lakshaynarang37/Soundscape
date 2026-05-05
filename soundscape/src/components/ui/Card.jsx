import React from "react";

function joinClass(base, extra) {
  return extra ? `${base} ${extra}` : base;
}

export function Card({ className, children, ...props }) {
  return (
    <div
      data-slot="card"
      className={joinClass(
        "bg-white/[0.03] text-card-foreground flex flex-col gap-0 rounded-[28px] border border-transparent py-0 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={joinClass("px-6 py-4 border-b border-white/5", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={joinClass("p-6", className)}
      {...props}
    />
  );
}

export default Card;
