export interface FolderNavigationItem {
  label: string;
  to: string;
  end?: boolean;
  disabled?: boolean;
  activePaths?: readonly string[];
}

export interface FolderNavigationProps {
  items: readonly FolderNavigationItem[];
  ariaLabel: string;
}
