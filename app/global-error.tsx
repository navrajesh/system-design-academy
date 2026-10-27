"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#f6f4ef] px-6 text-center text-[#161a1d]">
        <main className="max-w-lg">
          <p className="font-mono text-sm font-semibold text-[#3157d5]">UNEXPECTED ERROR</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold">This lesson hit an unplanned failure mode.</h1>
          <p className="mt-4 leading-7 text-slate-600">Your progress is stored safely in this browser. Retry the page, or return later if the problem continues.</p>
          <button onClick={reset} className="mt-7 rounded-xl bg-[#161a1d] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Try again</button>
        </main>
      </body>
    </html>
  );
}
