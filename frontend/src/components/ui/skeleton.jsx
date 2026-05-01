import * as React from "react";
import { cn } from "@/lib/utils";

/* Skeleton loading placeholder */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
