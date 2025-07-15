import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovieStatus } from '@prisma/client';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Titre du film',
    example: 'Inception',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

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
  releaseYear?: number;

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

  @ApiProperty({
    description: 'Statut du film',
    enum: MovieStatus,
    example: MovieStatus.TO_WATCH,
    required: false,
  })
  @IsEnum(MovieStatus)
  @IsOptional()
  status?: MovieStatus;

  @ApiProperty({
    description: 'Notes personnelles sur le film',
    example: 'À voir absolument !',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
