import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  readonly page: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  readonly limit: number = 10;
}
