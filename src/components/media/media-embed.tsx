interface MediaEmbedProps {
  url: string;
  title: string;
}

export function MediaEmbed({ url, title }: MediaEmbedProps) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("soundcloud")) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.9)]">
        <iframe
          title={`${title} – SoundCloud`}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff3ea5&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false`}
          className="w-full"
          loading="lazy"
        />
      </div>
    );
  }
  if (lower.includes("bandcamp")) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.9)]">
        <iframe
          title={`${title} – Bandcamp`}
          style={{ border: 0 }}
          className="h-56 w-full"
          src={`${url}/embed`}
          seamless
          loading="lazy"
        />
      </div>
    );
  }
  if (lower.includes("spotify")) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.9)]">
        <iframe
          title={`${title} – Spotify`}
          src={`https://open.spotify.com/embed/${url.split("spotify.com/")[1] ?? ""}`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="encrypted-media"
          loading="lazy"
          className="w-full"
        />
      </div>
    );
  }
  if (lower.includes("youtube")) {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch?.[1];
    if (!videoId) return null;
    return (
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.9)]">
        <iframe
          title={`${title} – YouTube`}
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full"
        />
      </div>
    );
  }
  return null;
}
