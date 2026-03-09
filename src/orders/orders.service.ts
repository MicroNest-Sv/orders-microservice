import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from '@src/common/services';

import { CreateOrderDto, OrderPaginationDto, ChangeStatusDto } from './dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: createOrderDto,
    });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page, perPage, status } = orderPaginationDto;

    return {
      meta: {
        totalItems: await this.prisma.order.count({ where: { status } }),
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
    console.log(id);
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
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
        message: `Order with id ${changeStatusDto.id} not found`,
      });
    }

    if (order.status === changeStatusDto.status) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Order with id ${changeStatusDto.id} already in status ${changeStatusDto.status}`,
      });
    }

    return this.prisma.order.update({
      where: { id: changeStatusDto.id },
      data: { status: changeStatusDto.status },
    });
  }
}
