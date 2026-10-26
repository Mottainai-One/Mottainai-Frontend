export interface SpeechOptions {
  language: string;
  rate: number;
  onStarted?: () => void;
}

export type SpeechResult =
  | { status: "completed" }
  | { status: "cancelled" }
  | { status: "error"; message: string };
