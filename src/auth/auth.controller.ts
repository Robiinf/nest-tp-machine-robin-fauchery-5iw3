import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';
import { Public } from '../shared/decorators/public.decorator';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès. Email de vérification envoyé.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Inscription réussie. Vérifiez votre email pour activer votre compte.' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur (étape 1 - envoi du code 2FA)' })
  @ApiResponse({
    status: 200,
    description: 'Code 2FA envoyé par email',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Code de vérification envoyé par email' },
        tempToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect / Email non vérifié',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérification du code 2FA (étape 2 - finalisation de la connexion)' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Token temporaire reçu lors de la connexion',
    required: true,
    schema: { type: 'string', example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Code invalide ou expiré / Token temporaire invalide',
  })
  async verifyTwoFactor(
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto,
    @Headers('authorization') authHeader: string,
  ) {
    const tempToken = authHeader?.replace('Bearer ', '');
    if (!tempToken) {
      throw new Error('Token temporaire requis');
    }
    return this.authService.verifyTwoFactor(verifyTwoFactorDto.code, tempToken);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Vérification de l\'adresse email' })
  @ApiQuery({
    name: 'token',
    description: 'Token de vérification reçu par email',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Email vérifié avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email vérifié avec succès' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Token expiré',
  })
  @ApiResponse({
    status: 404,
    description: 'Token invalide',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
