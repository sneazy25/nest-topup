import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface FindUserResult {
  status: 'ok' | 'error';
  data?: any;
  message: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<object> {
    try {
      const get = await this.prisma.user.findMany();
      return {
        status: 'ok',
        data: get,
        message: 'Users retrieved successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException({ status: 'error', message: error.message })
    }
  }

  async findByEmail(email: string): Promise<FindUserResult> {
    try {
      let find = await this.prisma.user.findUnique({
        where: { email: email },
      });

      if (!find) {
        return { status: 'error', message: 'Cannot find the user.' };
      }

      return { status: 'ok', data: find, message: 'User retrieved successfully.' };
    } catch (error) {
      throw new InternalServerErrorException({ status: 'error', message: error.message })
    }
  }

  async findUser(id: number): Promise<object> {
    try {
      const find = await this.prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!find) {
        throw new NotFoundException({ status: 'error', message: 'User not found.' })
      }

      return { status: "ok", data: find, message: "User retrieved successfully." };
    } catch (error) {
      throw new InternalServerErrorException({ status: 'error', message: error.message })
    }
  }
}
