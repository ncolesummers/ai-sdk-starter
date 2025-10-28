import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check admin authorization
  if (!isAdmin(session.user.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="font-bold text-3xl">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access the admin panel.
          </p>
          <p className="text-muted-foreground text-sm">
            If you believe this is an error, please contact your administrator.
          </p>
          <Link
            className="inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
            href="/"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link className="font-semibold text-lg" href="/admin">
              Admin Panel
            </Link>
            <nav className="flex gap-4">
              <Link
                className="text-muted-foreground text-sm hover:text-foreground"
                href="/admin/ollama"
              >
                Ollama Config
              </Link>
              <Link
                className="text-muted-foreground text-sm hover:text-foreground"
                href="/admin/ollama/models"
              >
                Models
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {session.user.email}
            </span>
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/"
            >
              Back to Chat
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
