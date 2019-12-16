import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { ClientState } from '../models/client-state';

@Injectable()
export class ClientService {

  constructor(
    private _notify: NotificationService
  ) { }

  currentPlay(cs: ClientState): void {
    this._notify.send({ subject: 'current play', body: cs });
  }

}
