import { AxiosError } from 'axios';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: FieldError[];
}

/** Extracts a human-readable message from any error thrown by the API layer. */
export function getErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.errors?.length) {
      return body.errors.map((e) => e.message).join(', ');
    }
    if (body?.message) return body.message;
    if (error.code === 'ERR_NETWORK') return 'Serverga ulanib bo\'lmadi. Internetni tekshiring.';
    if (error.code === 'ECONNABORTED') return 'So\'rov vaqti tugadi. Qaytadan urinib ko\'ring.';
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

/** Extracts per-field validation errors (from Zod errors returned by the API). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.errors?.length) {
      return body.errors.reduce<Record<string, string>>((acc, e) => {
        acc[e.field] = e.message;
        return acc;
      }, {});
    }
  }
  return {};
}

export function getStatusCode(error: unknown): number | undefined {
  if (error instanceof AxiosError) return error.response?.status;
  return undefined;
}
