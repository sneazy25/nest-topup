import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: AuthService,
        useValue: {
          login: jest.fn(),
          register: jest.fn(),
        },
      }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a token', async () => {
      const result = { status: 'ok', message: 'Login user successfully.', access_token: 'token' };

      jest.spyOn(authService, 'login').mockImplementation(async () => result);

      expect(await authController.login({ email: 'johndoe@gmail.com', password: 'password' } as LoginDto)).toBe(result);
    });
  });

  describe('register', () => {
    it('should return a token', async () => {
      const result = { status: 'ok', message: 'User created successfully.', access_token: 'token' };

      jest.spyOn(authService, 'register').mockImplementation(async () => result);

      expect(await authController.register({ name: 'John Doe', email: 'johndoe@gmail.com', password: 'password' } as RegisterDto)).toBe(result);
    });
  });
});
