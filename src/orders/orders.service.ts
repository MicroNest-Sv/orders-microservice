import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, OrderPaginationDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import { ChangeStatusDto } from './dto/change-status.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { limit, page, status } = orderPaginationDto;

    return {
      meta: {
        totalItems: await this.order.count({ where: { status } }),
        totalPages: Math.ceil(
          (await this.order.count({ where: { status } })) / limit,
        ),
        currentPage: page,
        lastPage: Math.ceil(
          (await this.order.count({ where: { status } })) / limit,
        ),
        itemsPerPage: limit,
      },
      data: await this.order.findMany({
        take: limit,
        skip: limit * (page - 1),
        where: { status },
      }),
    };
  }

  async findOne(id: string) {
    console.log(id);
    const order = await this.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    return order;
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const order = await this.order.findUnique({
      where: { id: changeStatusDto.id },
    });

    if (!order) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Order with id ${changeStatusDto.id} not found`,
      });
    }

    if (order.status === changeStatusDto.status) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Order with id ${changeStatusDto.id} already in status ${changeStatusDto.status}`,
      });
    }

    return this.order.update({
      where: { id: changeStatusDto.id },
      data: { status: changeStatusDto.status },
    });
  }
}
