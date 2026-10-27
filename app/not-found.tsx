import Link from "next/link";

export default function NotFound() {
  return <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-6 text-center"><div><p className="font-mono text-sm font-semibold text-cobalt">404 / LESSON NOT FOUND</p><h1 className="mt-4 font-display text-4xl font-semibold text-ink">That architecture is still on the whiteboard.</h1><p className="mt-4 text-slate-500">The lesson may have moved or has not been published yet.</p><Link href="/" className="mt-7 inline-block rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white">Back to the academy</Link></div></div>;
}
