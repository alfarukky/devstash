import type { ReactNode } from "react";

import { Layers } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
          <Layers className="size-4 text-white" />
        </div>
        <span className="text-lg font-semibold">DevStash</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
