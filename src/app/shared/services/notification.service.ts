import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs/Rx';
import { SocketMessage } from '../models/socket-message';
import { SocketService } from './socket.service';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

@Injectable()
export class NotificationService {

  notify = new Subject<SocketMessage>();
  connectionStatus = new BehaviorSubject<boolean>(false);
  constructor(private _socketService: SocketService, private _log: LoggingService) {
    this.socketsUp();
  }

  publish(SocketMessage: SocketMessage): void {
    this.notify.next(SocketMessage);
  }

  reject(content: any): void {
    this.notify.error(content);
  }

  listen(): Observable<SocketMessage> {
    return this.notify.asObservable();
  }

  send(SocketMessage: SocketMessage): void {
    this._log.log(`socket to API: ${JSON.stringify(SocketMessage)}`);
    if (environment.socket.subjects.indexOf(SocketMessage.subject) !== -1) {
      this._socketService.send<SocketMessage>(SocketMessage, SocketMessage.subject);
    }
  }

  socketsUp(): void {
    this.connectionStatus = this._socketService.socketConnected$;
    for (var i = 0; i < environment.socket.subjects.length; i++) {
      var subject = environment.socket.subjects[i];
      this.handleSockets(subject);
    }
  }

  private handleSockets(subject: string): void {
    this._socketService.listen(subject)
      .subscribe(m => {
        this._log.log(`socket from API: ${JSON.stringify(m)}`);
        this.publish(m);
      }, err => {
        this._log.error(err);
        this.reject(err);
      });
  }

}
