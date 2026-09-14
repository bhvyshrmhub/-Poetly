"use client";

import Link from "next/link";
import { dailyMoment } from "@/lib/moments";

export default function DailyMoment() {
  const moment = dailyMoment();

  return (
    <section className="daily-moment px-6 py-8 md:px-10 md:py-10 mb-8" aria-label="Daily Poetly moment">
      <p className="text-xs text-text-secondary mb-3">{moment.sub}</p>
      <p className="font-editorial text-2xl md:text-3xl text-text-primary max-w-xl">
        {moment.line}
      </p>
      <p className="text-xs text-text-tertiary mt-4">— Poetly</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/write" className="btn-primary text-sm">
          Write
        </Link>
        <Link href="/explore" className="btn-secondary text-sm">
          Explore
        </Link>
      </div>
    </section>
  );
}
