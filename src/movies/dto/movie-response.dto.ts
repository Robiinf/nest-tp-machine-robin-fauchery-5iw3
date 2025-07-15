import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty({ description: 'ID du film' })
  id: number;

  @ApiProperty({ description: 'Titre du film' })
  title: string;

  @ApiProperty({ description: 'Description du film', required: false })
  description?: string;

  @ApiProperty({ description: 'Réalisateur du film', required: false })
  director?: string;

  @ApiProperty({ description: 'Année de sortie', required: false })
  year?: number;

  @ApiProperty({ description: 'Genre du film', required: false })
  genre?: string;

  @ApiProperty({ description: 'Note du film', required: false })
  rating?: number;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;
}

export class UserMovieResponseDto extends MovieResponseDto {
  @ApiProperty({ 
    description: 'Statut de visionnage',
    enum: ['WANT_TO_WATCH', 'WATCHING', 'WATCHED'],
    required: false 
  })
  watchStatus?: string;

  @ApiProperty({ description: 'Date d\'ajout à la watchlist', required: false })
  addedToWatchlistAt?: Date;
}
