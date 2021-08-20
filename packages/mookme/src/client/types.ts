import { StepCommand } from '../types/step.types';

export interface LoginResponse {
  access_token: string;
}

export interface MeResponse {
  key: string;
}

export interface PublishStepBody {
  name: string;
  apiKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  step: any;
}

export interface PublishStepResponse {
  id: string;
  name: string;
}

export interface GetStepResponse {
  content: StepCommand;
}
