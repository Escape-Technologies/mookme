import axios, { AxiosError, AxiosInstance } from 'axios';
import config from '../config';
import logger from '../display/logger';
import {
  LoginResponse,
  MeResponse,
  PublishStepResponse,
  PublishStepBody,
  GetStepResponse,
  RegisterResponse,
} from './types';

export class MookmeClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.cli.backendUrl,
    });
  }

  async register(email: string, username: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await this.client.post<RegisterResponse>('/users', {
        email,
        password,
        passwordConfirmation: password,
        username,
      });
      return response.data;
    } catch (e) {
      handleResponseException(e);
      process.exit(1);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>('/auth/login', { email, password });
      this.client.defaults.headers['Authorization'] = response.data.access_token;
      return response.data;
    } catch (e) {
      handleResponseException(e);
      process.exit(1);
    }
  }

  async getMe(): Promise<MeResponse> {
    try {
      const response = await this.client.get<MeResponse>('/users/me');
      return response.data;
    } catch (e) {
      handleResponseException(e);
      process.exit(1);
    }
  }

  logout(): void {
    delete this.client.defaults.headers['Authorization'];
  }

  async publish(step: PublishStepBody): Promise<PublishStepResponse> {
    try {
      const response = await this.client.post<PublishStepResponse>('/steps', step);
      return response.data;
    } catch (e) {
      handleResponseException(e);
      process.exit(1);
    }
  }

  async getStep(stepAuthor: string, stepName: string): Promise<GetStepResponse> {
    try {
      const response = await this.client.get<GetStepResponse>(`/steps/from/${stepAuthor}/${stepName}`);
      return response.data;
    } catch (e) {
      handleResponseException(e);
      process.exit(1);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleResponseException(e: any) {
  if (e.isAxiosError) {
    parseAxiosError(e);
  } else {
    logger.success('An unknown error occured while publishing the step');
    console.error(e);
  }
}

function parseAxiosError(e: AxiosError): void {
  if (e.response) {
    logger.failure(`Error : received response with status ${e.response.status} from the server.`);
    logger.failure(`${'='.repeat(7)} Error content ${'='.repeat(7)}\n`);
    logger.log(e.response.data);
    logger.failure(`\n${'='.repeat(29)}`);
  } else {
    logger.failure(`Error : received no response from the server.`);
    logger.failure(`${'='.repeat(7)} Error content ${'='.repeat(7)}\n`);
    console.error(e);
    logger.failure(`\n${'='.repeat(29)}`);
  }
}
