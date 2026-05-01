import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CvEvent } from '../cv/events/cv.events';
import type { CvEventPayload } from '../cv/events/cv.events';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly discordWebhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('DISCORD_WEBHOOK_URL');
    if (!url) {
      throw new Error('DISCORD_WEBHOOK_URL is not defined in configuration');
    }
    this.discordWebhookUrl = url;
  }

  @OnEvent(CvEvent.CREATED)
  async handleCvCreatedForDiscord(payload: CvEventPayload) {
    this.logger.log(
      `CV #${payload.cvId} créé. Envoi de la notification Discord...`,
    );
    const discordPayload = {
      content: ' **Alerte Recrutement : Un nouveau profil est disponible !**',
      embeds: [
        {
          title: 'Nouveau Talent sur CvTech',
          description: 'Un candidat vient de mettre en ligne son CV.',
          color: 3447003,
          fields: [
            {
              name: 'ID du CV',
              value: `\`#${payload.cvId}\``,
              inline: true,
            },
            {
              name: "Créé par l'utilisateur",
              value: `\`ID: ${payload.performedBy}\``,
              inline: true,
            },
          ],
          footer: {
            text: 'CvTech Notification System',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await firstValueFrom(
        this.httpService.post(this.discordWebhookUrl, discordPayload),
      );
      this.logger.log(' Notification Discord envoyée avec succès !');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error("Échec de l'envoi vers Discord", errorMessage);
    }
  }
}
