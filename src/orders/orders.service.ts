import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

import { PrismaService } from '@src/common/services';

import { PRODUCTS_SERVICE } from './constants';
import { CreateOrderDto, ChangeStatusDto, OrderQueryDto } from './dto';
import { ProductsValidationResponse } from './interfaces';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const productIds = createOrderDto.items.map((item) => item.productId);

    const products = await firstValueFrom(
      this.productsClient
        .send<
          ProductsValidationResponse[]
        >({ cmd: 'validate_product_exists' }, productIds)
        .pipe(
          catchError((error: string | object) => {
            throw new RpcException(error);
          }),
        ),
    );

    return products;
  }

  async findAll(orderQueryDto: OrderQueryDto) {
    const { page, perPage, status } = orderQueryDto;

    return {
      pagination: {
        totalRecords: await this.prisma.order.count({ where: { status } }),
        totalPages: Math.ceil(
          (await this.prisma.order.count({ where: { status } })) / perPage,
        ),
        currentPage: page,
        lastPage: Math.ceil(
          (await this.prisma.order.count({ where: { status } })) / perPage,
        ),
        itemsPerPage: perPage,
      },
      data: await this.prisma.order.findMany({
        take: perPage,
        skip: perPage * (page - 1),
        where: { status },
      }),
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        messages: [`Order with id ${id} not found`],
      });
    }

    return order;
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: changeStatusDto.id },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        messages: [`Order with id ${changeStatusDto.id} not found`],
      });
    }

    if (order.status === changeStatusDto.status) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        messages: [
          `Order with id ${changeStatusDto.id} already in status ${changeStatusDto.status}`,
        ],
      });
    }

    return this.prisma.order.update({
      where: { id: changeStatusDto.id },
      data: { status: changeStatusDto.status },
    });
  }
}
