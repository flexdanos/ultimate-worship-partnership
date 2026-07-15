export const metadata = {
  title: "Gallery | My Ultimate Worship",
  description: "Photos and moments from worship events and ministry.",
};

// Placeholder items — replace with Supabase Storage URLs
const galleryItems = [
  { id: "1", alt: "Worship night — Accra 2024", src: null },
  { id: "2", alt: "Recording session — Studio A", src: null },
  { id: "3", alt: "Partner gathering — London 2024", src: null },
  { id: "4", alt: "Live worship — Lagos", src: null },
  { id: "5", alt: "Annual conference 2024", src: null },
  { id: "6", alt: "Youth worship night", src: null },
];

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Moments captured in the presence of God.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className="aspect-video overflow-hidden rounded-xl border bg-muted"
          >
            {item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover transition hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-muted-foreground">{item.alt}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
