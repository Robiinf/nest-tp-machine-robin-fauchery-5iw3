import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    description: 'Nouveau rôle de l\'utilisateur',
    enum: ['USER', 'ADMIN'],
  })
  @IsEnum(['USER', 'ADMIN'], { message: 'Le rôle doit être USER ou ADMIN' })
  @IsOptional()
  role?: 'USER' | 'ADMIN';
}
