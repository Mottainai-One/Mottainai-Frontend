export interface ChoiceGroupProps {
  id: string;
  legend: string;
  value: string | number;
  options: readonly (readonly [string | number, string])[];
  onChange: (value: string) => void;
}
