import { IsEnum, IsOptional } from 'class-validator';

import { PaginationDto } from '@src/common';
import { OrderStatus } from '@src/generated/prisma/enums';

import { OrderStatusList } from '../enums';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `status must be a valid enum value: ${OrderStatusList.join(', ')}`,
  })
  status: OrderStatus;
}
