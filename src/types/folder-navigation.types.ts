export interface FolderNavigationItem {
  label: string;
  to: string;
  end?: boolean;
}

export interface FolderNavigationProps {
  items: readonly FolderNavigationItem[];
  ariaLabel: string;
}
