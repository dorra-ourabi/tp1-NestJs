import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OnEvent } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  private readonly webhookUrl =
    'https://webhook.site/ac5587f4-8580-4f30-8102-4264139696c1';

  constructor(private readonly httpService: HttpService) {}

  @OnEvent('cv.created')
  async handleCvCreatedEvent(payload: any) {
    this.logger.log(`Événement cv.created détecté. Envoi du Webhook...`);

    const dataToSend = {
      message: 'Un nouveau talent a rejoint CvTech !',
      cvDetails: {
        id: payload.id,
        nom: payload.name,
        prenom: payload.firstname,
        job: payload.Job,
      },
    };

    try {
      await firstValueFrom(this.httpService.post(this.webhookUrl, dataToSend));
      this.logger.log('Webhook envoyé avec succès !');
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'envoi du Webhook",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
