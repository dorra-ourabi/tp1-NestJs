import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OnEvent } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import { CvEvent } from 'src/cv/events/cv.events';
import type { CvEventPayload } from 'src/cv/events/cv.events';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  private readonly webhookUrl =
    'https://webhook.site/ac5587f4-8580-4f30-8102-4264139696c1';

  constructor(private readonly httpService: HttpService) {}

  @OnEvent(CvEvent.CREATED)
  async handleCvCreated(payload: CvEventPayload) {
    this.logger.log(
      `Événement ${payload.type} intercepté pour le CV #${payload.cvId}. Déclenchement du Webhook...`,
    );

    const webhookData = {
      event: 'NEW_TALENT_ALERT',
      message: "Un nouveau CV vient d'être publié sur la plateforme CvTech !",
      data: {
        cvId: payload.cvId,
        proprietaireId: payload.ownerId,
        ajoutePar: payload.performedBy,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await firstValueFrom(this.httpService.post(this.webhookUrl, webhookData));
      this.logger.log('Webhook envoyé avec succès vers le service externe !');
    } catch (error) {
      this.logger.error(
        "Échec de l'envoi du Webhook",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
