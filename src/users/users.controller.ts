import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { RequireEmailVerification } from '../shared/decorators/require-email-verification.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { AuthUser } from '../shared/interfaces/auth.interface';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @RequireEmailVerification()
  @ApiOperation({ summary: 'Récupérer son profil utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Get()
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Rôle admin requis',
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID (Admin uniquement)' })
  @ApiParam({
    name: 'id',
    description: 'ID de l\'utilisateur',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur récupéré avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Rôle admin requis',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiOperation({ summary: 'Modifier le rôle d\'un utilisateur (Admin uniquement)' })
  @ApiParam({
    name: 'id',
    description: 'ID de l\'utilisateur',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Rôle modifié avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé ou tentative de modification de son propre rôle',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<UserResponseDto> {
    return this.usersService.updateRole(id, updateUserRoleDto, currentUser.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin uniquement)' })
  @ApiParam({
    name: 'id',
    description: 'ID de l\'utilisateur',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Utilisateur supprimé avec succès' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé ou tentative de suppression de son propre compte',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<{ message: string }> {
    return this.usersService.deleteUser(id, currentUser.id);
  }
}
