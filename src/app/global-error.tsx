"use client"; // Error boundaries must be Client Components

import "bulma/css/bulma.min.css";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * root layout, so it must render its own <html> and <body>.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <section className="section">
          <div className="container">
            <h1 className="title">Something went wrong</h1>
            <p className="mb-4">An unexpected error occurred.</p>
            <button type="button" className="button is-primary" onClick={retry}>
              Try again
            </button>
          </div>
        </section>
      </body>
    </html>
  );
}
