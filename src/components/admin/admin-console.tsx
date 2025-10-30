"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PretixEventSummary {
  slug: string;
  name: Record<string, string>;
  date_from: string;
  date_to?: string;
  location?: string;
  is_public: boolean;
}

interface SanityEventSummary {
  _id: string;
  title: string;
  slug: string;
  pretixEventId?: string;
  published?: boolean;
  start?: string;
  end?: string;
  venue?: string;
}

interface ArtistSummary {
  id: string;
  name: string;
  role: string;
  tags: string[];
  socials: Record<string, string>;
  bio: string;
}

interface ArtistFormState {
  name: string;
  role: string;
  tags: string;
  socials: Record<string, string>;
  bio: string;
}

const SOCIAL_KEYS: Array<{ key: keyof ArtistSummary["socials"]; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "bandcamp", label: "Bandcamp" },
  { key: "spotify", label: "Spotify" },
  { key: "youtube", label: "YouTube" },
];

const buildArtistFormState = (artist: ArtistSummary): ArtistFormState => ({
  name: artist.name,
  role: artist.role ?? "",
  tags: artist.tags.join(", "),
  socials: SOCIAL_KEYS.reduce<Record<string, string>>((acc, { key }) => {
    const value = artist.socials[key as string];
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {}),
  bio: artist.bio,
});

export function AdminConsole() {
  const [pretixLoading, setPretixLoading] = useState(false);
  const [pretixError, setPretixError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pretixEvents, setPretixEvents] = useState<PretixEventSummary[]>([]);
  const [sanityEvents, setSanityEvents] = useState<SanityEventSummary[]>([]);

  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [artistSaving, setArtistSaving] = useState(false);
  const [artistSuccess, setArtistSuccess] = useState<string | null>(null);
  const [artistForm, setArtistForm] = useState<ArtistFormState | null>(null);

  useEffect(() => {
    const loadArtists = async () => {
      setArtistsLoading(true);
      setArtistError(null);
      try {
        const response = await fetch("/api/admin/artists", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load artists (${response.status})`);
        }
        const data = (await response.json()) as { artists: ArtistSummary[] };
        setArtists(data.artists);
        if (data.artists.length) {
          setSelectedArtistId(data.artists[0].id);
        }
      } catch (error) {
        setArtistError(error instanceof Error ? error.message : "Unable to load artists.");
      } finally {
        setArtistsLoading(false);
      }
    };

    loadArtists();
  }, []);

  useEffect(() => {
    if (!selectedArtistId) {
      setArtistForm(null);
      return;
    }
    const artist = artists.find((item) => item.id === selectedArtistId);
    if (!artist) {
      setArtistForm(null);
      return;
    }
    setArtistForm(buildArtistFormState(artist));
    setArtistSuccess(null);
  }, [selectedArtistId, artists]);

  const eventStatus = useMemo(() => {
    const map = new Map<string, SanityEventSummary>();
    for (const event of sanityEvents) {
      if (event.pretixEventId) {
        map.set(event.pretixEventId, event);
      }
    }
    return map;
  }, [sanityEvents]);

  const handleRefreshPretix = async () => {
    setPretixLoading(true);
    setPretixError(null);
    try {
      const response = await fetch("/api/admin/pretix/events", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load Pretix events (${response.status})`);
      }
      const data = (await response.json()) as {
        pretix: PretixEventSummary[];
        events: SanityEventSummary[];
      };
      setPretixEvents(data.pretix);
      setSanityEvents(data.events);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      setPretixError(error instanceof Error ? error.message : "Unable to refresh Pretix events.");
    } finally {
      setPretixLoading(false);
    }
  };

  const updatePublished = async (eventId: string, published: boolean) => {
    setPretixError(null);
    try {
      const response = await fetch("/api/admin/events/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, published }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update event (${response.status})`);
      }
      setSanityEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, published } : event,
        ),
      );
    } catch (error) {
      setPretixError(error instanceof Error ? error.message : "Unable to update event status.");
    }
  };

  const createEvent = async (pretixSlug: string) => {
    setPretixError(null);
    try {
      const response = await fetch("/api/admin/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pretixSlug }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? `Failed to create event (${response.status})`);
      }
      await handleRefreshPretix();
    } catch (error) {
      setPretixError(error instanceof Error ? error.message : "Unable to create event in Sanity.");
    }
  };

  const handleArtistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!artistForm || !selectedArtistId) {
      return;
    }
    setArtistSaving(true);
    setArtistSuccess(null);
    setArtistError(null);
    try {
      const tags = artistForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const response = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: selectedArtistId,
          name: artistForm.name.trim(),
          role: artistForm.role.trim(),
          tags,
          socials: artistForm.socials,
          bio: artistForm.bio,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? `Failed to update artist (${response.status})`);
      }
      setArtistSuccess("Artist updated successfully.");
      setArtists((prev) =>
        prev.map((artist) =>
          artist.id === selectedArtistId
            ? {
                ...artist,
                name: artistForm.name,
                role: artistForm.role,
                tags,
                socials: { ...artistForm.socials },
                bio: artistForm.bio,
              }
            : artist,
        ),
      );
    } catch (error) {
      setArtistError(error instanceof Error ? error.message : "Unable to save artist.");
    } finally {
      setArtistSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="aer-panel space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
              Pretix sync
            </p>
            <h2 className="font-display text-[1.6rem] uppercase tracking-[0.08em] text-foreground">
              Synchronize ticketed events
            </h2>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">
              Refresh the Pretix feed, create missing Sanity entries, and toggle published status.
            </p>
          </div>
          <Button onClick={handleRefreshPretix} disabled={pretixLoading} variant="primary">
            {pretixLoading ? "Refreshing…" : "Refresh Pretix events"}
          </Button>
        </header>
        {lastSyncedAt ? (
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.55)]">
            Last synced: {new Date(lastSyncedAt).toLocaleString()}
          </p>
        ) : null}
        {pretixError ? (
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,16,42,0.7)]">{pretixError}</p>
        ) : null}
        <div className="aer-list">
          {pretixEvents.length === 0 ? (
            <div className="aer-list__item text-[0.7rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.55)]">
              Click “Refresh Pretix events” to load the latest schedule.
            </div>
          ) : (
            pretixEvents.map((pretixEvent) => {
              const linkedEvent = eventStatus.get(pretixEvent.slug);
              const isPublished = linkedEvent?.published;
              const exists = Boolean(linkedEvent);
              return (
                <div
                  key={pretixEvent.slug}
                  className={cn(
                    "aer-list__item flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                    isPublished ? "border-[rgba(255,16,42,0.38)]" : "border-[rgba(255,255,255,0.16)]",
                  )}
                >
                  <div>
                    <span className="aer-list__label">
                      {pretixEvent.name?.en ?? pretixEvent.slug}
                    </span>
                    <span className="aer-list__value flex flex-col gap-1 text-[0.64rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.6)]">
                      <span>Pretix slug: {pretixEvent.slug}</span>
                      <span>
                        {new Date(pretixEvent.date_from).toLocaleString()} {pretixEvent.location ? `· ${pretixEvent.location}` : ""}
                      </span>
                      <span>
                        {exists
                          ? isPublished
                            ? "Status: published on site"
                            : "Status: hidden on site"
                          : "Status: not synced to Sanity"}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exists ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={pretixLoading || isPublished}
                          onClick={() => linkedEvent && updatePublished(linkedEvent._id, true)}
                        >
                          Enable
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pretixLoading || !isPublished}
                          onClick={() => linkedEvent && updatePublished(linkedEvent._id, false)}
                        >
                          Disable
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={pretixLoading}
                        onClick={() => createEvent(pretixEvent.slug)}
                      >
                        Create in Sanity
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="aer-panel space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
              Artist management
            </p>
            <h2 className="font-display text-[1.6rem] uppercase tracking-[0.08em] text-foreground">
              Edit roster profiles
            </h2>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">
              Update copy, roles, tags and socials directly without leaving the console.
            </p>
          </div>
        </header>
        {artistError ? (
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,16,42,0.7)]">{artistError}</p>
        ) : null}
        {artistsLoading ? (
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">
            Loading artists…
          </p>
        ) : artists.length === 0 ? (
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">
            No artists found in Sanity.
          </p>
        ) : null}

        {artistForm ? (
          <form onSubmit={handleArtistSubmit} className="space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                Select artist
              </span>
              <select
                className="aer-input bg-transparent text-sm uppercase tracking-[0.18em]"
                value={selectedArtistId}
                onChange={(event) => setSelectedArtistId(event.target.value)}
              >
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id} className="bg-black">
                    {artist.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                  Name
                </span>
                <Input
                  required
                  value={artistForm.name}
                  onChange={(event) =>
                    setArtistForm((prev) => prev && { ...prev, name: event.target.value })
                  }
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                  Role / title
                </span>
                <Input
                  value={artistForm.role}
                  onChange={(event) =>
                    setArtistForm((prev) => prev && { ...prev, role: event.target.value })
                  }
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                Tags (comma separated)
              </span>
              <Input
                value={artistForm.tags}
                onChange={(event) =>
                  setArtistForm((prev) => prev && { ...prev, tags: event.target.value })
                }
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              {SOCIAL_KEYS.map(({ key, label }) => (
                <label key={key} className="flex flex-col gap-2">
                  <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                    {label}
                  </span>
                  <Input
                    value={artistForm.socials[key] ?? ""}
                    onChange={(event) =>
                      setArtistForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              socials: { ...prev.socials, [key]: event.target.value },
                            }
                          : prev,
                      )
                    }
                    placeholder="https://"
                  />
                </label>
              ))}
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                Biography
              </span>
              <Textarea
                className="min-h-[160px]"
                value={artistForm.bio}
                onChange={(event) =>
                  setArtistForm((prev) => prev && { ...prev, bio: event.target.value })
                }
                placeholder="Enter paragraphs separated by blank lines."
              />
            </label>

            {artistSuccess ? (
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(74,255,135,0.7)]">
                {artistSuccess}
              </p>
            ) : null}
            {artistError && !artistsLoading ? (
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,16,42,0.7)]">
                {artistError}
              </p>
            ) : null}

            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={artistSaving}>
                {artistSaving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const artist = artists.find((item) => item.id === selectedArtistId);
                  if (artist) {
                    setArtistForm(buildArtistFormState(artist));
                    setArtistSuccess(null);
                    setArtistError(null);
                  }
                }}
                disabled={artistSaving}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
