import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function LocaleNotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        404
      </p>
      <h1 className="font-display text-4xl uppercase tracking-tightest">
        Signal lost in the void.
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground">
        The page you tried to reach is off the grid. Return to the main transmission and stay tuned for the next drop.
      </p>
      <Button asChild variant="accent">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
