 export interface ApiResposta<T> {
  success?: boolean;
  data?: T | null;
  message?: string;
  error?: string;
}
