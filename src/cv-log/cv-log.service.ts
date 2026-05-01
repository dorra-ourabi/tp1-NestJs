import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { CvLog } from './cv-log.entity';
import { CvEvent } from '../cv/events/cv.events';
import type { CvEventPayload } from '../cv/events/cv.events';

interface SseClient {
  userId: number;
  role: string;
  subject: Subject<CvLog>;
}

@Injectable()
export class CvLogService {
  private clients: SseClient[] = [];

  constructor(
    @InjectRepository(CvLog)
    private readonly logRepo: Repository<CvLog>,
  ) {}

  // ── SSE : abonner un client ──────────────────────────────────────────
  subscribe(userId: number, role: string): Subject<CvLog> {
    const subject = new Subject<CvLog>();
    this.clients.push({ userId, role, subject });
    console.log('Client SSE connecté, total clients:', this.clients.length);

    // Nettoyer la liste quand le client se déconnecte
    subject.subscribe({
      complete: () => {
        this.clients = this.clients.filter((c) => c.subject !== subject);
      },
    });

    return subject;
  }

  
  // ── Écoute des events CV ─────────────────────────────────────────────
  @OnEvent(CvEvent.CREATED)
  async handleCvCreated(payload: CvEventPayload): Promise<void> {
    await this.persistAndNotify(payload);
  }

  @OnEvent(CvEvent.UPDATED)
  async handleCvUpdated(payload: CvEventPayload): Promise<void> {
    await this.persistAndNotify(payload);
  }

  @OnEvent(CvEvent.DELETED)
  async handleCvDeleted(payload: CvEventPayload): Promise<void> {
    await this.persistAndNotify(payload);
  }

  private async persistAndNotify(payload: CvEventPayload): Promise<void> {

    console.log('Event reçu:', payload.type);           
    console.log('Clients connectés:', this.clients.length);
    console.log('ownerId payload:', payload.ownerId, 'clients:', this.clients.map(c => ({ userId: c.userId, role: c.role })));
    // 1. Persister le log en base
    const log = this.logRepo.create({
      cvId:        payload.cvId,
      ownerId:     payload.ownerId,
      type:        payload.type,
      performedBy: payload.performedBy,
    });
    const saved = await this.logRepo.save(log);

    // 2. Notifier les clients SSE connectés selon leur rôle
    for (const client of this.clients) {
      const isAdmin = client.role === 'admin';
      const isOwner = client.userId === payload.ownerId;

      if (isAdmin || isOwner) {
        client.subject.next(saved);
      }
    }
  }

  // ── Historique ───────────────────────────────────────────────────────
  findAll(): Promise<CvLog[]> {
    return this.logRepo.find({ order: { performedAt: 'DESC' } });
  }

  findByOwner(ownerId: number): Promise<CvLog[]> {
    return this.logRepo.find({
      where: { ownerId },
      order: { performedAt: 'DESC' },
    });
  }
}