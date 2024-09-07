import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma.service';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryService = {
    findAll: jest.fn(),
    findProduct: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        PrismaService,
        {
          provide: 'CategoryService',
          useValue: mockCategoryService,
        }],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(categoryController).toBeDefined();
  });

  it('should get all category', async () => {
    const mockfindAll = { status: 'ok', data: {}, message: 'Categories retrieved successfully.' };

    jest.spyOn(categoryService, 'findAll').mockResolvedValue(mockfindAll);
    const categories = await categoryController.getAllCategory();

    expect(categories).toBe(mockfindAll);
  });

  it('should find product by category', async () => {
    const mockfindProduct = [
      {
        id: 1, title: 'product title', slug: 'product-title', description: 'product desc', poster: 'media/product.jpg', form: {}, published: true, deletedAt: null, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
      }
    ]

    const slug = 'category';

    jest.spyOn(categoryService, 'findProduct').mockResolvedValue(mockfindProduct);

    const categories = await categoryController.findProductByCategory(slug);

    expect(categories).toBe(mockfindProduct);
  });
});
