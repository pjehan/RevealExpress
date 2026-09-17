// Types shared between the server and the browser client

export type UserMode = 'presenter' | 'spectator';

/** Configuration sent to the browser: must never contain the presenter password */
export interface PublicConfig {
  name: string;
  port: number;
  revealjs: Record<string, unknown>;
}

export interface SlideIndices {
  h: number;
  v: number;
}

/** Quiz form entries as [input name, input value] pairs */
export type QuizAnswers = [name: string, value: string][];

export interface ServerToClientEvents {
  slidechanged: (indices: SlideIndices) => void;
  quizsubmitted: (answers: QuizAnswers) => void;
}

export interface ClientToServerEvents {
  slidechanged: (indices: SlideIndices) => void;
  /** Ask for the presenter's current slide (null if the presenter has not shared it yet) */
  currentslide: (callback: (indices: SlideIndices | null) => void) => void;
  quizsubmitted: (answers: QuizAnswers) => void;
}
