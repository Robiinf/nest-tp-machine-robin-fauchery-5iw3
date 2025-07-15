import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'ID de l\'utilisateur' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'Email de l\'utilisateur' })
  email: string;

  @ApiProperty({ example: 'USER', description: 'Rôle de l\'utilisateur' })
  role: string;

  @ApiProperty({ example: true, description: 'Statut de vérification de l\'email' })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Date de mise à jour' })
  updatedAt: Date;
}
