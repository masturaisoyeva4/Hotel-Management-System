import api from '../lib/api';
import { Employee, ApiResponse } from '../types';

export interface EmployeePayload {
  userId: string;
  hotelId: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
}

export const employeesService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Employee[]>>('/employees', { params }).then((r) => r.data.data),

  create: (payload: EmployeePayload) =>
    api.post<ApiResponse<Employee>>('/employees', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<EmployeePayload>) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/employees/${id}`).then((r) => r.data),
};
