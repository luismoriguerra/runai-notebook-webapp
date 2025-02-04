'use client';

import { useEffect } from 'react';
import { BreadcrumbItem, useBreadcrumb } from './providers/breadcrumb-provider';

export function SetBreadcrumb({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  const { setBreadcrumbs } = useBreadcrumb();
  
  useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  return null;
} 