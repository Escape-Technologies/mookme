export interface Step {
  id: number;
  name: string;
  rawContent: string;
  owner: StepOwner;
  content: StepContent;
}

export interface StepOwner {
  id: number;
  email: string;
  username: string;
}

export interface StepContent {
  name: string;
  command: string;
  onlyOn?: string;
  serial?: string;
}
