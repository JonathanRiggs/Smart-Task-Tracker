"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

/**
 * Catches errors thrown by any authenticated page. The header and sidebar
 * (from the layout above) stay on screen, so the user can navigate away.
 */
export default function AppError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <div className="notification is-danger is-light">
      <p className="title is-5">Something went wrong</p>
      <p className="mb-4">
        We couldn&apos;t load this page. Please try again.
        {digest && (
          <>
            <br />
            <small>Reference: {digest}</small>
          </>
        )}
      </p>
      <button type="button" className="button is-danger" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
