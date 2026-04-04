import { IsString, IsUrl, IsUUID } from 'class-validator';

export class PaymentSucceededDto {
  @IsString()
  @IsUUID()
  orderId: string;

  @IsString()
  paymentIntentId: string;

  @IsString()
  @IsUrl()
  receiptUrl: string;
}
