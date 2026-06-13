import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';
import { CreateEmployeeDto } from './employees.dto';

export class EmployeesService {
  async findAll(query: Record<string, string>) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = { isActive: true };
    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.department) where.department = { contains: query.department, mode: 'insensitive' };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          hotel: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return { employees, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, role: true } },
        hotel: true,
      },
    });
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    return prisma.employee.create({
      data: {
        ...dto,
        hireDate: new Date(dto.hireDate),
        salary: dto.salary,
      },
      include: { user: true },
    });
  }

  async update(id: string, dto: Partial<CreateEmployeeDto>) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.hireDate) data.hireDate = new Date(dto.hireDate);
    return prisma.employee.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.employee.update({ where: { id }, data: { isActive: false } });
  }
}
