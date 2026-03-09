import { IsUUID, IsEnum } from 'class-validator';

import { OrderStatus } from '@src/generated/prisma/enums';

export class ChangeStatusDto {
  @IsUUID()
  id: string;

  @IsEnum(OrderStatus, {
    message: `status must be one of the following values: ${Object.values(
      OrderStatus,
    ).join(', ')}`,
  })
  status: OrderStatus;
}
