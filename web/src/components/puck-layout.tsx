"use client";

import React from "react";
import { DropZone } from "@puckeditor/core";

export const PuckSection = ({ padding, background }: { padding: string, background: string }) => {
  const paddingClass = padding === "none" ? "py-0" : padding === "sm" ? "py-8" : padding === "lg" ? "py-24" : "py-16";
  const bgClass = background === "surface" ? "bg-[var(--surface)]/30" : background === "dark" ? "bg-[var(--background)]" : "";
  return (
    <section className={`${paddingClass} ${bgClass} w-full relative overflow-hidden`}>
       <DropZone zone="content" />
    </section>
  );
};

export const PuckColumns = ({ distribution }: { distribution: string }) => {
  const gridClass = distribution === "1/2" ? "md:grid-cols-[1fr_2fr]" : distribution === "2/1" ? "md:grid-cols-[2fr_1fr]" : "md:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-8 w-full px-4 md:px-12 lg:px-20 py-8`}>
      <div className="w-full">
        <DropZone zone="left" />
      </div>
      <div className="w-full">
        <DropZone zone="right" />
      </div>
    </div>
  );
};
