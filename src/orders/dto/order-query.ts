import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dtos';
import { OrderStatus } from '@src/generated/prisma/enums';

import { OrderStatusList } from '../enums';

export class OrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `status must be a valid enum value: ${OrderStatusList.join(', ')}`,
  })
  status: OrderStatus;
}
