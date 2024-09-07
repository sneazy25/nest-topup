import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './register.dto';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        UserService,
        JwtService,
        ConfigService,
        {
          provide: 'PrismaService, UserService, JwtService, ConfigService',
          useValue: {
            user: {
              create: jest.fn(),
              findByEmail: jest.fn(),
              signAsync: jest.fn(),
            }
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should create new user', async () => {
      const mockUserResult = {
        id: 1,
        email: 'johndoe2@gmail.com',
        name: 'John Doe 1',
        role: Role.USER,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUserResult);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      jest.spyOn(authService, 'register').mockResolvedValue({
        status: 'ok',
        message: 'Register user successfully.',
        access_token: 'token',
      });

      const result = await authService.register({
        name: mockUserResult.name,
        email: mockUserResult.email,
        password: mockUserResult.password
      } as RegisterDto);

      expect(result).toEqual(
        {
          status: 'ok',
          message: 'Register user successfully.',
          access_token: 'token',
        }
      );
    });

    it('should throw BadRequestException if user already exist', async () => {
      const errorMessage = 'User already exist.';
      const user = {
        name: 'Fulan',
        email: 'johndoe@gmail.com',
        password: 'password',
      }

      jest.spyOn(userService, 'findByEmail').mockRejectedValue(new Error(errorMessage));

      const result = authService.register(user as RegisterDto);
      await expect(result).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const mockUserResult = {
        id: 1,
        email: 'johndoe@gmail.com',
        name: 'John Doe 1',
        role: Role.USER,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await authService.login(mockUserResult.email, mockUserResult.password);

      expect(result).toEqual(
        {
          status: 'ok',
          message: 'Login user successfully.',
          access_token: 'token',
        }
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const errorMessage = 'User not found.';
      const user = {
        email: 'fulan@gmail.com',
        password: 'password',
      }

      jest.spyOn(userService, 'findByEmail').mockRejectedValue(new Error(errorMessage));

      const result = authService.login(user.email, user.password);
      await expect(result).rejects.toThrow(
        new NotFoundException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const errorMessage = 'Invalid credentials.';
      const mockUserResult = {
        id: 1,
        email: 'johndoe@gmail.com',
        name: 'John Doe 1',
        role: Role.USER,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(userService, 'findByEmail').mockResolvedValue({ status: 'ok', data: mockUserResult, message: 'User found.' });

      const result = authService.login(mockUserResult.email, 'invalidpassword');
      await expect(result).rejects.toThrow(
        new UnauthorizedException({ status: 'error', message: errorMessage }),
      );
    });
  });
});
