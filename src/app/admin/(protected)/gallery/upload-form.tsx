"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focal, setFocal] = useState({ x: 50, y: 50 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startFocalX: number;
    startFocalY: number;
  } | null>(null);

  // Revoke the object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFocal({ x: 50, y: 50 });
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handlePickFocalPoint(e: React.MouseEvent<HTMLImageElement>) {
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
    // Dragging the photo moves the visible crop the opposite way.
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("focalX", String(focal.x));
      formData.set("focalY", String(focal.y));

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Upload failed");
      }

      formRef.current?.reset();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFocal({ x: 50, y: 50 });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Image
          </label>
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            onChange={handleFileChange}
            className="block w-full text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Alt text
          </label>
          <input
            type="text"
            name="alt"
            required
            placeholder="e.g. Worship night — Accra 2024"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !previewUrl}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {isSubmitting ? "Uploading…" : "Upload"}
        </button>
      </div>

      {previewUrl && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Click the image to choose what part shows in the gallery
            </p>
            <div className="relative overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                onClick={handlePickFocalPoint}
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
                src={previewUrl}
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
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
