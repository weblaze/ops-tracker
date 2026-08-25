import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-1 flex-col justify-center px-4 py-8">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ClipboardList className="size-5" />
        </div>
        <h1 className="text-xl font-semibold">Manager Dashboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-sm font-normal text-muted-foreground">Enter the dashboard PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next ?? "/dashboard"} />
            <Input
              type="password"
              name="pin"
              inputMode="numeric"
              placeholder="PIN"
              autoFocus
              required
              className="h-14 text-center text-2xl tracking-widest"
            />
            {error && <p className="text-center text-sm text-destructive">Wrong PIN — try again.</p>}
            <Button type="submit" className="h-11">
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
