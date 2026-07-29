"use client";

export interface LightboxImage {
  url: string;
  alt: string;
}

export function ImageLightbox({
  image,
  onClose,
}: {
  image: LightboxImage | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/90 p-4 fade-in duration-200 motion-reduce:duration-0"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 text-2xl text-white/80 transition hover:scale-110 hover:text-white"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full animate-in rounded-lg object-contain zoom-in-95 duration-300 ease-out-expo motion-reduce:duration-0"
      />
    </div>
  );
}
