import { InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from 'src/prisma.service';

describe('ProductService', () => {
  let productService: ProductService;
  let prismaService: PrismaService;

  const mockProductResult = [{
    id: 1,
    title: 'Product 1',
    slug: 'product-1',
    description: 'Description 1',
    poster: 'Poster 1',
    categories: [{
      productId: 1,
      categoryId: 1,
      category: {
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
      },
    }],
    variations: [{
      id: 1,
      productId: 1,
      productCode: 'P001',
      title: 'Variation 1',
      description: 'Description 1',
      price: 100,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }],
    published: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }];

  const mockAddProduct = {
    title: 'Product 1',
    slug: 'product-1',
    description: 'Description 1',
    poster: 'https://image.url/update-image.jpg',
    categories: ['Pulsa'],
    variations: [{
      product_code: 'P001',
      title: 'Variation 1',
      description: 'Description 1',
      price: 100,
      published: true,
    }],
    published: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService, PrismaService,
        {
          provide: 'ProductService',
          useValue: {
            findAll: jest.fn(),
            getProduct: jest.fn(),
            createProduct: jest.fn(),
            updateProduct: jest.fn(),
            deleteProduct: jest.fn(),
          }
        }
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(mockProductResult);

      expect(await productService.findAll()).toEqual({
        status: 'ok',
        data: mockProductResult,
        message: 'Products retrieved successfully.'
      });
    });

    it('should return empty array if no product found', async () => {
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([]);

      expect(await productService.findAll()).toEqual({
        status: 'ok',
        data: [],
        message: 'Products retrieved successfully.'
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(productService.findAll()).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage })
      );
    });
  });

  describe('getProduct', () => {
    it('should return a product', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(mockProductResult[0]);

      expect(await productService.getProduct(1)).toEqual({
        status: 'ok',
        data: mockProductResult[0],
        message: 'Product retrieved successfully.'
      });
    });

    it('should throw a NotFoundException if product not found', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);

      await expect(productService.getProduct(1)).rejects.toThrow(
        new NotFoundException({ status: 'error', message: 'Product not found.' })
      );
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findUnique').mockRejectedValue(new Error(errorMessage));

      await expect(productService.getProduct(1)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage })
      );
    });
  });

  describe('findProduct', () => {
    it('should return a product', async () => {
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(mockProductResult);

      expect(await productService.findProduct('Product 1')).toEqual({
        status: 'ok',
        data: mockProductResult,
        message: 'Product retrieved successfully.'
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(null);

      await expect(productService.findProduct('Product 1')).rejects.toThrow(
        new NotFoundException({ status: 'error', message: 'Cannot find the product.' })
      );
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(productService.findProduct('Product 1')).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage })
      );
    });
  });

  describe('addProduct', () => {
    it('should create a product', async () => {
      jest.spyOn(prismaService.product, 'create').mockResolvedValue(mockProductResult[0]);

      expect(await productService.addProduct(mockAddProduct as any)).toEqual({
        status: 'ok',
        data: mockProductResult[0],
        message: 'Product created successfully.'
      });
    });

    it('should throw a BadRequestException if product slug already exists', async () => {
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(mockProductResult[0]);

      await expect(productService.addProduct(mockAddProduct as any)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: 'Slug already exist for other product.' })
      );
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = "Cannot read properties of undefined (reading 'map')";
      jest.spyOn(prismaService.product, 'create').mockRejectedValue(new Error(errorMessage));

      await expect(productService.addProduct(mockAddProduct as any)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage })
      );
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(mockProductResult[0]);
      jest.spyOn(productService, 'categoryOperations').mockResolvedValue([]);
      jest.spyOn(productService, 'variationOperations').mockResolvedValue([]);
      jest.spyOn(productService, 'checkProductCodes').mockResolvedValue(true);
      jest.spyOn(prismaService.product, 'update').mockResolvedValue(mockProductResult[0]);

      const result = await productService.updateProduct(1, mockAddProduct as any);
      expect(result).toEqual({
        status: 'ok',
        data: mockProductResult[0],
        message: 'Product updated successfully.'
      });
    });

    it('should throw a NotFoundException if product not found', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);

      await expect(productService.updateProduct(1, mockAddProduct as any)).rejects.toThrow(
        new NotFoundException({ status: 'error', message: 'Product not found.' })
      );
    });

    it('should throw a BadRequestException if product slug already exists', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(mockProductResult[0]);
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(mockProductResult[0]);

      await expect(productService.updateProduct(1, mockAddProduct as any)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: 'Slug already exist for other product.' })
      );
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(mockProductResult[0]);
      jest.spyOn(productService, 'categoryOperations').mockResolvedValue([]);
      jest.spyOn(productService, 'variationOperations').mockResolvedValue([]);
      jest.spyOn(productService, 'checkProductCodes').mockResolvedValue(true);
      jest.spyOn(prismaService.product, 'update').mockRejectedValue(new Error(errorMessage));

      await expect(productService.updateProduct(1, mockAddProduct as any)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage })
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      jest.spyOn(productService, 'getProduct').mockResolvedValue(mockProductResult[0]);
      jest.spyOn(prismaService.product, 'delete').mockResolvedValue(mockProductResult[0]);

      expect(await productService.deleteProduct(1)).toEqual({
        status: 'ok',
        data: [],
        message: 'Product deleted successfully.'
      });
    });

    it('should throw a NotFoundException if product not found', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);

      await expect(productService.deleteProduct(1)).rejects.toThrow(
        new NotFoundException({ status: 'error', message: 'Product not found.' })
      );
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findUnique').mockRejectedValue(new Error(errorMessage));

      await expect(productService.deleteProduct(1)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage })
      );
    });
  });
});
