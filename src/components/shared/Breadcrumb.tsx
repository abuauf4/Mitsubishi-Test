'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      <ol className="flex items-center gap-1.5 text-xs sm:text-sm">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-mitsu-red/40 hover:text-mitsu-red transition-colors tracking-wider uppercase"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-mitsu-red/20" />
            {index === items.length - 1 ? (
              <span className="text-mitsu-red font-semibold tracking-wider uppercase">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-mitsu-red/40 hover:text-mitsu-red transition-colors tracking-wider uppercase"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
