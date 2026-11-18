"use client";

import { catchError, type ErrorInfo } from "next/error";

function SidebarErrorFallback(_props: object, { retry }: ErrorInfo) {
  return (
    <p className="has-text-danger is-size-7">
      Couldn&apos;t load projects.{" "}
      <button
        type="button"
        className="button is-text is-small p-0"
        onClick={() => retry()}
      >
        Retry
      </button>
    </p>
  );
}

export const SidebarErrorBoundary = catchError(SidebarErrorFallback);
