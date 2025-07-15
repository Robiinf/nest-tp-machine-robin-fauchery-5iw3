import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_EMAIL_VERIFICATION_KEY } from '../decorators/require-email-verification.decorator';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireEmailVerification = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_EMAIL_VERIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireEmailVerification) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre email pour accéder à cette ressource');
    }

    return true;
  }
}
