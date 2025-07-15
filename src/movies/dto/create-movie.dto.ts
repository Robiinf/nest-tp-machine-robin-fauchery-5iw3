import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Titre du film',
    example: 'Inception',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description du film',
    example: 'Un thriller de science-fiction sur les rêves dans les rêves.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Réalisateur du film',
    example: 'Christopher Nolan',
    required: false,
  })
  @IsString()
  @IsOptional()
  director?: string;

  @ApiProperty({
    description: 'Année de sortie',
    example: 2010,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear() + 10)
  year?: number;

  @ApiProperty({
    description: 'Genre du film',
    example: 'Science-Fiction, Thriller',
    required: false,
  })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiProperty({
    description: 'Note du film (sur 10)',
    example: 8.8,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  rating?: number;
}
