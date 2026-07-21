"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/gallery/image-lightbox";
import { DeleteButton } from "./delete-button";
import { FocalPointEditor } from "./focal-point-editor";

interface AdminGalleryItem {
  id: string;
  alt: string;
  url: string;
  focalX: number;
  focalY: number;
}

export function AdminGalleryGrid({ images }: { images: AdminGalleryItem[] }) {
  const [selected, setSelected] = useState<AdminGalleryItem | null>(null);
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-video overflow-hidden rounded-xl border bg-muted"
          >
            <button
              type="button"
              onClick={() => setSelected(image)}
              className="block h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }}
                className="h-full w-full object-cover"
              />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/60 px-3 py-2 opacity-0 transition group-hover:opacity-100">
              <p className="truncate text-xs text-white">{image.alt}</p>
              <div className="pointer-events-auto flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(image)}
                  className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  Edit crop
                </button>
                <DeleteButton id={image.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImageLightbox image={selected} onClose={() => setSelected(null)} />
      {editing && (
        <FocalPointEditor image={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
