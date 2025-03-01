import { OrderStatus } from '@prisma/client';
import { IsUUID, IsEnum } from 'class-validator';

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
