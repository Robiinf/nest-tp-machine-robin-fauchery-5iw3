import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WatchStatus } from '@prisma/client';

export { WatchStatus };

export class UpdateWatchStatusDto {
  @ApiProperty({
    description: 'Statut de visionnage',
    enum: WatchStatus,
    example: WatchStatus.WATCHED,
  })
  @IsEnum(WatchStatus)
  status: WatchStatus;
}
