import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma.service';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        PrismaService,
        {
          provide: 'PrismaService',
          useValue: {
            category: {
              findMany: jest.fn(),
            }
          }
        }
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockfindAll = [{ id: 1, name: 'category', slug: 'category' }]

      jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(mockfindAll);

      const result = await categoryService.findAll();

      expect(result).toEqual({
        status: 'ok',
        data: mockfindAll,
        message: 'Categories retrieved successfully.',
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.category, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(categoryService.findAll()).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });
  });

  describe('findProduct', () => {
    it('should return products by category', async () => {
      const mockfindProduct = [
        {
          id: 1, title: 'product title', slug: 'product-title', description: 'product desc', poster: 'media/product.jpg', form: {}, published: true, deletedAt: null, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
        }
      ]

      const slug = 'category';

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValueOnce(mockfindProduct);

      const result = await categoryService.findProduct(slug);

      expect(result).toEqual({
        status: 'ok',
        data: mockfindProduct,
        message: 'Products retrieved successfully.',
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const slug = 'category';
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(categoryService.findProduct(slug)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });
  });
});
