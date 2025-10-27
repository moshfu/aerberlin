import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function VerifyEmailPage() {
  return (
    <div className="aer-subpage">
      <div className="aer-subpage__inner flex min-h-[60vh] flex-col items-center justify-center gap-8 py-12 text-center">
        <p className="text-[0.62rem] uppercase tracking-[0.32em] text-[rgba(255,255,255,0.55)]">
          Check your inbox
        </p>
        <h1 className="font-display text-[2.8rem] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.92)]">
          Magic link sent
        </h1>
        <p className="max-w-md text-[0.72rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.55)]">
          We dispatched a secure login link. Open it within the next hour to sign in.
        </p>
        <Button asChild variant="ghost">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
