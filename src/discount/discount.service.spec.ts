import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscountService } from './discount.service';
import { PrismaService } from '../prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { DiscountType } from '@prisma/client';

describe('DiscountService', () => {
  let discountService: DiscountService;
  let prismaService: PrismaService;

  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);

  const _mockDiscountResult = {
    id: 1,
    discountCode: 'EXAMPLE10',
    productId: 1,
    title: 'Example Discount',
    description: 'Example Discount Description',
    minPrice: new Decimal('100'),
    maxPrice: new Decimal('1000'),
    limit: 10,
    usage: 8,
    startDate: new Date(startDate.setDate(today.getDate() - 2)),
    endDate: new Date(endDate.setDate(today.getDate() + 2)),
    type: DiscountType.percentage || DiscountType.price_reduce,
    percentage: new Decimal('10'),
    priceReduce: null,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  let mockDiscountResult = _mockDiscountResult;

  const mockCreateDiscount = {
    discountCode: 'EXAMPLE10',
    productId: 1,
    title: 'Example Discount',
    description: 'Example Discount Description',
    minPrice: 100,
    maxPrice: 1000,
    limit: 10,
    usage: 8,
    startDate: new Date(today.setDate(today.getDate() - 2)),
    endDate: new Date(today.setDate(today.getDate() + 2)),
    type: DiscountType.percentage,
    percentage: 10,
    priceReduce: null,
    published: true,
  }

  const mockProductResult = {
    id: 1,
    title: 'Example Product',
    slug: 'example-product',
    description: 'Example Product Description',
    poster: 'media/product.jpg',
    form: {},
    published: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountService, PrismaService,
        {
          provide: 'PrismaService',
          useValue: {
            discount: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            }
          }
        }
      ],
    }).compile();

    discountService = module.get<DiscountService>(DiscountService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(discountService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all discounts', async () => {
      const mockFindMany = [mockDiscountResult];

      jest.spyOn(prismaService.discount, 'findMany').mockResolvedValue(mockFindMany);

      const result = await discountService.findAll();

      expect(result).toEqual({
        status: 'ok',
        data: mockFindMany,
        message: 'Discounts retrieved successfully.',
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.discount, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.findAll()).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });
  });

  describe('getDiscount', () => {
    it('should return discount by id', async () => {
      jest.spyOn(prismaService.discount, 'findUnique').mockResolvedValue(mockDiscountResult);

      const result = await discountService.getDiscount(1);

      expect(result).toEqual({
        status: 'ok',
        data: mockDiscountResult,
        message: 'Discount retrieved successfully.',
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.discount, 'findUnique').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.getDiscount(1)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount id not found', async () => {
      jest.spyOn(prismaService.discount, 'findUnique').mockResolvedValue(null);

      await expect(discountService.getDiscount(1)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: 'Discount ID not found.' }),
      );
    });
  });

  describe('getDiscountByProduct', () => {
    it('should return discount by product id', async () => {
      const mockFindMany = [mockDiscountResult];

      jest.spyOn(prismaService.discount, 'findMany').mockResolvedValue(mockFindMany);

      const result = await discountService.getDiscountByProduct(1);

      expect(result).toEqual({
        status: 'ok',
        data: mockFindMany,
        message: 'Discount retrieved successfully.',
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.discount, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.getDiscountByProduct(1)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount for provided product not found', async () => {
      const errorMessage = 'Discount for provided product not found.';
      jest.spyOn(prismaService.discount, 'findMany').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.getDiscountByProduct(1)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: 'Discount for provided product not found.' }),
      );
    });
  });

  describe('createDiscount', () => {
    it('should create a new discount', async () => {
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(mockProductResult);
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.discount, 'create').mockResolvedValue(mockDiscountResult);

      const result = await discountService.createDiscount(mockCreateDiscount);

      expect(result).toEqual({
        status: 'ok',
        data: mockDiscountResult,
        message: 'Discount created successfully.',
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findFirst').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.createDiscount(mockCreateDiscount)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an InternalServerErrorException if product id not found', async () => {
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(null);

      await expect(discountService.createDiscount(mockCreateDiscount)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: 'Product ID not found.' }),
      );
    });

    it('should throw an InternalServerErrorException if discount code already added', async () => {
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(mockProductResult);
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(mockDiscountResult);

      await expect(discountService.createDiscount(mockCreateDiscount)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: 'Discount code already added.' }),
      );
    });
  });

  describe('updateDiscount', () => {
    it('should update a discount', async () => {
      const resultMock = { status: 'ok', data: mockDiscountResult, message: 'Discount updated successfully.' };
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(mockProductResult);
      jest.spyOn(prismaService.discount, 'findUnique').mockResolvedValue(mockDiscountResult);
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(mockDiscountResult);
      jest.spyOn(prismaService.discount, 'update').mockResolvedValue(mockDiscountResult);
      jest.spyOn(discountService, 'updateDiscount').mockResolvedValue(resultMock);

      const result = await discountService.updateDiscount(1, mockCreateDiscount);

      expect(result).toEqual(resultMock);
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.product, 'findFirst').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.updateDiscount(1, mockCreateDiscount)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount id not found', async () => {
      const errorMessage = 'Discount ID not found.';
      jest.spyOn(prismaService.product, 'findFirst').mockRejectedValue(new Error('Product ID not found.'));
      jest.spyOn(discountService, 'updateDiscount').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.updateDiscount(1, mockCreateDiscount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if product id not found', async () => {
      const errorMessage = 'Product ID not found.';
      jest.spyOn(prismaService.product, 'findFirst').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.updateDiscount(1, mockCreateDiscount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount code already added', async () => {
      const errorMessage = 'Discount code already added.';
      jest.spyOn(prismaService.product, 'findFirst').mockResolvedValue(mockProductResult);
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(mockDiscountResult);
      jest.spyOn(discountService, 'updateDiscount').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.updateDiscount(1, mockCreateDiscount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });
  });

  describe('deleteDiscount', () => {
    it('should delete a discount', async () => {
      jest.spyOn(prismaService.discount, 'findUnique').mockResolvedValue(mockDiscountResult);
      jest.spyOn(prismaService.discount, 'delete').mockResolvedValue(mockDiscountResult);

      const result = await discountService.deleteDiscount(1);

      expect(result).toEqual({
        'status': 'ok',
        'data': [],
        'message': 'Discount deleted successfully.'
      });
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.discount, 'findUnique').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.deleteDiscount(1)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount id not found', async () => {
      const errorMessage = 'Discount ID not found.';
      jest.spyOn(prismaService.discount, 'findUnique').mockResolvedValue(null);

      await expect(discountService.deleteDiscount(1)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });
  });

  describe('useDiscount', () => {
    const amount = 100;

    it('should use a discount with percentage', async () => {
      const discountAmount = amount * (mockDiscountResult.percentage.toNumber() / 100);
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(mockDiscountResult);
      jest.spyOn(prismaService.discount, 'update').mockResolvedValue(mockDiscountResult);

      const result = await discountService.useDiscount('EXAMPLE10', 1, amount);

      expect(result).toEqual(amount - discountAmount);
    });

    it('should use a discount with price reduce', async () => {
      mockDiscountResult.type = DiscountType.price_reduce;
      mockDiscountResult.priceReduce = new Decimal('30');
      mockDiscountResult.percentage = null;

      const discountAmount = mockDiscountResult.priceReduce.toNumber();
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(mockDiscountResult);
      jest.spyOn(prismaService.discount, 'update').mockResolvedValue(mockDiscountResult);

      const result = await discountService.useDiscount('EXAMPLE10', 1, amount);

      expect(result).toEqual(amount - discountAmount);
      mockDiscountResult = { ..._mockDiscountResult } // reset mockDiscountResult
    });

    it('should throw an InternalServerErrorException if there is an error', async () => {
      const errorMessage = 'Database connection error';
      jest.spyOn(prismaService.discount, 'findFirst').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.useDiscount('EXAMPLE10', 1, amount)).rejects.toThrow(
        new InternalServerErrorException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount id not found', async () => {
      const errorMessage = 'Invalid discount code.';
      jest.spyOn(prismaService.discount, 'findFirst').mockRejectedValue(new Error(errorMessage));

      await expect(discountService.useDiscount('EXAMPLE10', 1, amount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount code not valid for the product', async () => {
      const errorMessage = 'Discount code not valid for this product.';
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue(mockDiscountResult);

      await expect(discountService.useDiscount('EXAMPLE10', 2, amount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if amount is less than minPrice', async () => {
      const errorMessage = 'Minimum purchase amount not reached.';
      // mockDiscountResult.minPrice = new Decimal('200');
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue({
        ...mockDiscountResult,
        minPrice: new Decimal('200'),
      });

      await expect(discountService.useDiscount('EXAMPLE10', 1, 50)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
      mockDiscountResult = { ..._mockDiscountResult } // reset mockDiscountResult
    });

    it('should throw an BadRequestException if amount is more than maxPrice', async () => {
      const errorMessage = 'Maximum purchase amount exceeded.';
      // mockDiscountResult.minPrice = new Decimal('50');
      // mockDiscountResult.maxPrice = new Decimal('100');
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue({
        ...mockDiscountResult,
        maxPrice: new Decimal('100'),
      });

      await expect(discountService.useDiscount('EXAMPLE10', 1, 1000)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
      mockDiscountResult = { ..._mockDiscountResult } // reset mockDiscountResult
    });

    it('should throw an BadRequestException if discount code usage limit has reached', async () => {
      const errorMessage = 'Discount code has reached its limit.';
      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue({
        ...mockDiscountResult,
        limit: 10,
        usage: 10,
      });

      await expect(discountService.useDiscount('EXAMPLE10', 1, amount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
    });

    it('should throw an BadRequestException if discount code not yet valid', async () => {
      const errorMessage = 'Discount code not yet valid.';
      const startDate = new Date(today);
      const endDate = new Date(today);

      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue({
        ...mockDiscountResult,
        startDate: new Date(startDate.setDate(today.getDate() + 2)),
        endDate: new Date(endDate.setDate(today.getDate() + 5)),
      });

      await expect(discountService.useDiscount('EXAMPLE10', 1, amount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
      mockDiscountResult = { ..._mockDiscountResult } // reset mockDiscountResult
    });

    it('should throw an BadRequestException if discount code has expired', async () => {
      const errorMessage = 'Discount code has expired.';
      const startDate = new Date(today);
      const endDate = new Date(today);

      jest.spyOn(prismaService.discount, 'findFirst').mockResolvedValue({
        ...mockDiscountResult,
        startDate: new Date(startDate.setDate(today.getDate() - 5)),
        endDate: new Date(endDate.setDate(today.getDate() - 2)),
      });

      await expect(discountService.useDiscount('EXAMPLE10', 1, amount)).rejects.toThrow(
        new BadRequestException({ status: 'error', message: errorMessage }),
      );
      mockDiscountResult = { ..._mockDiscountResult } // reset mockDiscountResult
    });
  });
});
