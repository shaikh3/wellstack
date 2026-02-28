"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = "/" + arr.slice(0, index + 1).join("/");
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: index < arr.length - 1 ? href : undefined,
      };
    });

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500">
      <Link href="/portfolio" className="hover:text-slate-900">
        Portfolio
      </Link>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-900">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
