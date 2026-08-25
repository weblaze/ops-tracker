import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-1 flex-col justify-center px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Manager Dashboard</h1>
      <form action={loginAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <input
          type="password"
          name="pin"
          inputMode="numeric"
          placeholder="PIN"
          autoFocus
          required
          className="min-h-14 rounded-lg border border-gray-300 px-4 text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {error && <p className="text-center text-sm text-red-600">Wrong PIN — try again.</p>}
        <button
          type="submit"
          className="min-h-13 rounded-lg bg-blue-600 text-base font-semibold text-white active:bg-blue-700"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
