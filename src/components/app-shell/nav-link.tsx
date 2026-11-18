"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

type NavLinkProps = {
  href: string;
  /** Only match this exact path, not nested routes under it. */
  exact?: boolean;
  children: React.ReactNode;
};

/**
 * A sidebar link that highlights itself when its route is active.
 *
 * The current path is only known at request time, so the highlighted version
 * streams in under Suspense; until then a plain link is shown.
 */
export function NavLink({ href, children, exact = false }: NavLinkProps) {
  return (
    <Suspense fallback={<Link href={href}>{children}</Link>}>
      <ActiveAwareLink href={href} exact={exact}>
        {children}
      </ActiveAwareLink>
    </Suspense>
  );
}

function ActiveAwareLink({ href, exact, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={isActive ? "is-active" : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
