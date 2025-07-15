import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../shared/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Générer un token de vérification d'email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerificationToken,
      },
    });

    // Créer l'entrée de vérification d'email
    await this.prisma.emailVerification.create({
      data: {
        token: emailVerificationToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Envoyer l'email de vérification
    await this.mailService.sendEmailVerification(email, emailVerificationToken);

    return {
      message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
    };
  }

  async login(loginDto: LoginDto): Promise<{ message: string; tempToken?: string }> {
    const { email, password } = loginDto;

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
    }

    // Générer et envoyer le code 2FA
    const twoFactorCode = this.generateTwoFactorCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire dans 10 min

    await this.prisma.twoFactorCode.create({
      data: {
        code: twoFactorCode,
        userId: user.id,
        expiresAt,
      },
    });

    await this.mailService.sendTwoFactorCode(email, twoFactorCode);

    // Générer un token temporaire pour la 2FA
    const tempToken = this.jwtService.sign(
      { sub: user.id, email: user.email, temp: true },
      { expiresIn: '10m' }
    );

    return {
      message: 'Code de vérification envoyé par email',
      tempToken,
    };
  }

  async verifyTwoFactor(code: string, tempToken: string): Promise<{ accessToken: string }> {
    // Vérifier le token temporaire
    let payload;
    try {
      payload = this.jwtService.verify(tempToken);
      if (!payload.temp) {
        throw new UnauthorizedException('Token invalide');
      }
    } catch {
      throw new UnauthorizedException('Token expiré ou invalide');
    }

    // Trouver le code 2FA
    const twoFactorRecord = await this.prisma.twoFactorCode.findFirst({
      where: {
        code,
        userId: payload.sub,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!twoFactorRecord) {
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    // Marquer le code comme utilisé
    await this.prisma.twoFactorCode.update({
      where: { id: twoFactorRecord.id },
      data: { isUsed: true },
    });

    // Générer le token JWT final
    const jwtPayload: JwtPayload = {
      sub: twoFactorRecord.user.id,
      email: twoFactorRecord.user.email,
      role: twoFactorRecord.user.role,
      isEmailVerified: twoFactorRecord.user.isEmailVerified,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    return { accessToken };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new NotFoundException('Token de vérification invalide');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Le token de vérification a expiré');
    }

    // Mettre à jour l'utilisateur
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    // Supprimer la vérification
    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return { message: 'Email vérifié avec succès' };
  }

  private generateTwoFactorCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
