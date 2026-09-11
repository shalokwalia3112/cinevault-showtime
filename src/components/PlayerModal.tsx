import { X } from "lucide-react";
import { embedUrl } from "@/lib/tmdb";

export function PlayerModal({
  movie,
  onClose,
}: {
  movie: { id: number; title: string } | null;
  onClose: () => void;
}) {
  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl overflow-hidden rounded-lg bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-display text-lg tracking-wide uppercase">{movie.title}</span>
          <button
            onClick={onClose}
            aria-label="Close player"
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            key={movie.id}
            src={embedUrl()}
            title={`${movie.title} player`}
            className="h-full w-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
          />
        </div>
      </div>
    </div>
  );
}
