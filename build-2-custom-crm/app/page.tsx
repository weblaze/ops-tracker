import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold">Ops Tracker</h1>
      <Link
        href="/daily-update"
        className="min-h-14 rounded-lg bg-blue-600 px-5 py-4 text-center text-lg font-semibold text-white active:bg-blue-700"
      >
        Daily Update
      </Link>
      <Link
        href="/lead-gen"
        className="min-h-14 rounded-lg bg-gray-900 px-5 py-4 text-center text-lg font-semibold text-white active:bg-gray-800"
      >
        Lead Generation
      </Link>
      <Link href="/dashboard" className="mt-6 text-center text-sm text-gray-400">
        Manager dashboard
      </Link>
    </main>
  );
}
