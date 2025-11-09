import Image from "next/image";

import { auth, signIn } from "@/server/auth";
import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const googleIcon = (
  <span aria-hidden className="flex h-5 w-5 items-center justify-center">
    <svg viewBox="0 0 18 18" aria-hidden className="h-5 w-5">
      <g fill="none" fillRule="evenodd">
        <path
          d="M17.64 9.205c0-.638-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.717v2.26h2.908c1.703-1.569 2.685-3.881 2.685-6.618"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.468-.807 5.957-2.177l-2.908-2.26c-.807.54-1.84.86-3.049.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A9 9 0 0 0 9 18"
          fill="#34A853"
        />
        <path
          d="M3.964 10.713A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.713V4.955H.957A9 9 0 0 0 0 9c0 1.452.348 2.828.957 4.045z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.545c1.32 0 2.505.454 3.438 1.346l2.579-2.579C13.462.891 11.424 0 9 0A9 9 0 0 0 .957 4.955l2.725 2.332C4.672 5.128 6.656 3.545 9 3.545"
          fill="#EA4335"
        />
      </g>
    </svg>
  </span>
);

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session) redirect("/bases");

  const resolvedSearchParams = (await searchParams) ?? {};

  const callbackParam = resolvedSearchParams.callbackUrl;
  const callbackUrl = Array.isArray(callbackParam)
    ? callbackParam[0]
    : callbackParam;
  const errorParam = resolvedSearchParams.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const handleGoogleSignIn = async () => {
    "use server";

    await signIn("google", {
      redirectTo: callbackUrl ?? "/bases",
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10 text-zinc-900">
      <section className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl shadow-zinc-200/70">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            src="/images/small-logo.svg"
            alt="Airtable Clone logo"
            width={48}
            height={48}
            priority
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Sign in to Airtable Clone
            </h1>
            <p className="text-sm text-zinc-500">
              Use your Google account to access your workspaces and bases.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          <form action={handleGoogleSignIn} className="w-full">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              {googleIcon}
              Sign in with Google
            </button>
          </form>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error === "OAuthSignin"
                ? "We couldn’t start the Google sign-in flow. Please try again."
                : "There was a problem signing you in. Please try again."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
