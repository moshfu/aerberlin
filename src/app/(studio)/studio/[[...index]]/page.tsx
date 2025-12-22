'use client';

import { Studio } from "sanity";
import studioConfig from "../../../../../sanity/sanity.config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function StudioPage() {
  return <Studio config={studioConfig} />;
}
