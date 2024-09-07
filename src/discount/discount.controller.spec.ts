import { Test, TestingModule } from '@nestjs/testing';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateDiscountDto } from './create.dto';

describe('DiscountController', () => {
  let discountController: DiscountController;
  let discountService: DiscountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountController],
      providers: [
        DiscountService, PrismaService, JwtService,
        {
          provide: 'DiscountService',
          useValue: {
            findAll: jest.fn(),
            getDiscount: jest.fn(),
            getDiscountByProduct: jest.fn(),
            createDiscount: jest.fn(),
            updateDiscount: jest.fn(),
            deleteDiscount: jest.fn(),
            useDiscount: jest.fn(),
          },
        },
      ],
    }).compile();

    discountController = module.get<DiscountController>(DiscountController);
    discountService = module.get<DiscountService>(DiscountService);
  });

  it('should be defined', () => {
    expect(discountController).toBeDefined();
  });

  it('should return all discount', async () => {
    const mockDiscount = { status: 'ok', data: {}, message: 'Discounts retrieved successfully.' };

    jest.spyOn(discountService, 'findAll').mockResolvedValue(mockDiscount);
    const discount = await discountController.getAllDiscount();

    expect(discount).toEqual(mockDiscount);
  });

  it('should return discount by id', async () => {
    const mockDiscount = { status: 'ok', data: {}, message: 'Discount retrieved successfully.' };

    jest.spyOn(discountService, 'getDiscount').mockResolvedValue(mockDiscount);
    const discount = await discountController.getDiscount(1);

    expect(discount).toEqual(mockDiscount);
  });

  it('should return discount by product id', async () => {
    const mockDiscount = { status: 'ok', data: {}, message: 'Discount retrieved successfully.' };

    jest.spyOn(discountService, 'getDiscountByProduct').mockResolvedValue(mockDiscount);
    const discount = await discountController.getDiscountByProduct(1);

    expect(discount).toEqual(mockDiscount);
  });

  it('should create discount', async () => {
    const createDiscountMock = {
      discountCode: 'EXAMPLE10',
      productId: 1,
      title: 'Example Discount',
      description: 'Example Discount Description',
      minPrice: 100,
      maxPrice: 1000,
      startDate: new Date(),
      endDate: new Date(),
      type: 'percentage',
      percentage: 10,
      published: true,
    };
    const mockDiscount = { status: 'ok', data: createDiscountMock, message: 'Discount created successfully.' };

    jest.spyOn(discountService, 'createDiscount').mockResolvedValue(mockDiscount);

    const discount = await discountController.createDiscount(createDiscountMock as CreateDiscountDto);

    expect(discount).toEqual(mockDiscount);
  });

  it('should update discount', async () => {
    const updateDiscountMock = {
      discountCode: 'EXAMPLE10',
      productId: 1,
      title: 'Example Discount',
      description: 'Example Discount Description',
      minPrice: 100,
      maxPrice: 1000,
      startDate: new Date(),
      endDate: new Date(),
      type: 'percentage',
      percentage: 10,
      published: true,
    };
    const mockDiscount = { status: 'ok', data: updateDiscountMock, message: 'Discount updated successfully.' };

    jest.spyOn(discountService, 'updateDiscount').mockResolvedValue(mockDiscount);

    const discount = await discountController.updateDiscount(1, updateDiscountMock as CreateDiscountDto);

    expect(discount).toEqual(mockDiscount);
  });

  it('should delete discount', async () => {
    const mockDiscount = { status: 'ok', message: 'Discount deleted successfully.' };

    jest.spyOn(discountService, 'deleteDiscount').mockResolvedValue(mockDiscount);

    const discount = await discountController.deleteDiscount(1);

    expect(discount).toEqual(mockDiscount);
  });
});
