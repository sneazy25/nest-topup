import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';
import { ProductService } from './product/product.service';
import { CategoryController } from './category/category.controller';
import { CategoryModule } from './category/category.module';
import { CategoryService } from './category/category.service';
import { DiscountModule } from './discount/discount.module';
import { DiscountController } from './discount/discount.controller';
import { DiscountService } from './discount/discount.service';
import { TransactionModule } from './transaction/transaction.module';
import { HttpModule } from '@nestjs/axios';
import { TopupModule } from './topup/topup.module';
import { ExportModule } from './export/export.module';
import { NotificationModule } from './notification/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { RefundModule } from './refund/refund.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    HttpModule, AuthModule, UserModule, ProductModule, CategoryModule, DiscountModule, TransactionModule, TopupModule, ExportModule, NotificationModule, RefundModule],
  controllers: [AuthController, UserController, ProductController, CategoryController, DiscountController],
  providers: [PrismaService, AuthService, UserService, ProductService, CategoryService, DiscountService],
})
export class AppModule { }
