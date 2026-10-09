import type { ReactNode } from 'react';

export interface DetailsModalField {
  id: string;
  label: string;
  value: string;
}

export interface DetailsModalProps {
  title: string;
  description?: string;
  fields: readonly DetailsModalField[];
  triggerElement: HTMLButtonElement | null;
  onClose: () => void;
  children?: ReactNode;
}

export interface OpenDetailsDialog<T> {
  record: T;
  trigger: HTMLButtonElement;
}
