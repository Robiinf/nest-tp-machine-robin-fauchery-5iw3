import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WatchStatus {
  WANT_TO_WATCH = 'WANT_TO_WATCH',
  WATCHING = 'WATCHING',
  WATCHED = 'WATCHED',
}

export class UpdateWatchStatusDto {
  @ApiProperty({
    description: 'Statut de visionnage',
    enum: WatchStatus,
    example: WatchStatus.WATCHED,
  })
  @IsEnum(WatchStatus)
  status: WatchStatus;
}
