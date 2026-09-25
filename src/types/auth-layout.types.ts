import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  title: string;
  description: string;
  mascotSrc: string;
  mascotAlt: string;
  children: ReactNode;
}
