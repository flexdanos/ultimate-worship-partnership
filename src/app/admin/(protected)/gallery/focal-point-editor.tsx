"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface FocalPointEditorImage {
  id: string;
  alt: string;
  url: string;
  focalX: number;
  focalY: number;
}

export function FocalPointEditor({
  image,
  onClose,
}: {
  image: FocalPointEditorImage;
  onClose: () => void;
}) {
  const router = useRouter();
  const [focal, setFocal] = useState({ x: image.focalX, y: image.focalY });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startFocalX: number;
    startFocalY: number;
  } | null>(null);

  function handlePick(e: React.MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocal({
      x: Math.round(Math.min(100, Math.max(0, x))),
      y: Math.round(Math.min(100, Math.max(0, y))),
    });
  }

  function handlePreviewDragStart(e: React.PointerEvent<HTMLImageElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startFocalX: focal.x,
      startFocalY: focal.y,
    };
  }

  function handlePreviewDragMove(e: React.PointerEvent<HTMLImageElement>) {
    if (!dragState.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;
    const x = dragState.current.startFocalX - (deltaX / rect.width) * 100;
    const y = dragState.current.startFocalY - (deltaY / rect.height) * 100;
    setFocal({
      x: Math.round(Math.min(100, Math.max(0, x))),
      y: Math.round(Math.min(100, Math.max(0, y))),
    });
  }

  function handlePreviewDragEnd() {
    dragState.current = null;
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/gallery/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focalX: focal.x, focalY: focal.y }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-sm font-semibold">Adjust image crop</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Click the image to choose what part shows in the gallery.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                onClick={handlePick}
                className="w-full cursor-crosshair select-none"
              />
              <div
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-amber-400/40"
                style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Gallery preview — drag to reposition
            </p>
            <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                onPointerDown={handlePreviewDragStart}
                onPointerMove={handlePreviewDragMove}
                onPointerUp={handlePreviewDragEnd}
                onPointerCancel={handlePreviewDragEnd}
                style={{
                  objectPosition: `${focal.x}% ${focal.y}%`,
                  touchAction: "none",
                }}
                className="h-full w-full cursor-grab object-cover active:cursor-grabbing"
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
