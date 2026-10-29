import type { AccessibilityPreferenceKey, AccessibilityPreferences } from "@/types/accessibility.types";

export interface ChoiceGroupProps {
  id: string;
  legend: string;
  value: string | number;
  options: readonly (readonly [string | number, string])[];
  onChange: (value: string) => void;
}

export interface AccessibilityPanelProps {
  id: string;
  isOpen: boolean;
  preferences: AccessibilityPreferences;
  onPreferenceChange: <K extends AccessibilityPreferenceKey>(key: K, value: AccessibilityPreferences[K]) => void;
  onResetPreferences: () => void;
  onClose: () => void;
}
