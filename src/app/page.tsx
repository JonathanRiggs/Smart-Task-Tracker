import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

/** Public landing page. Authenticated pages live under app/(app). */
export default function Home() {
  return (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="title">Smart Task Tracker</h1>
          <p className="subtitle">
            Organize your tasks by project and due date.
          </p>
          <div className="buttons is-centered">
            <Suspense>
              <Show when="signed-out">
                <SignInButton>
                  <button type="button" className="button">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button type="button" className="button is-primary">
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/inbox" className="button is-primary">
                  Go to Inbox
                </Link>
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
