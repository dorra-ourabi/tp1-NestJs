export enum CvEvent {
  CREATED = 'cv.created',
  UPDATED = 'cv.updated',
  DELETED = 'cv.deleted',
}

export interface CvEventPayload {
  cvId: number;
  ownerId: number;
  type: CvEvent;
  performedBy: number;
}