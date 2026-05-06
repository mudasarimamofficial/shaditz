import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  email: string;
  password: string;
  error: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => Promise<void>;
};

export function AdminLogin({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#112121] p-8 text-white shadow-xl shadow-black/20">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-white/60">
            Sign in with your Supabase Auth admin email + password.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit();
          }}
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="admin@yourdomain.com"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="********"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="h-12">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
