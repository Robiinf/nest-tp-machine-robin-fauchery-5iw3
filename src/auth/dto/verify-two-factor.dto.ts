import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Code de vérification à 6 chiffres',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le code est requis' })
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  code: string;
}
