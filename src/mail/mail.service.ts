import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('APP_URL')}/auth/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Vérifiez votre adresse email - Watchlist',
      html: `
        <h1>Bienvenue sur Watchlist !</h1>
        <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Vérifier mon email
        </a>
        <p>Ou copiez ce lien dans votre navigateur : ${verificationUrl}</p>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    });
  }

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Code de vérification - Watchlist',
      html: `
        <h1>Code de vérification</h1>
        <p>Votre code de vérification à 2 facteurs est :</p>
        <h2 style="font-family: monospace; font-size: 32px; color: #007bff; letter-spacing: 5px;">${code}</h2>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      `,
    });
  }
}
