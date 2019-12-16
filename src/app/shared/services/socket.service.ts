import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

@Injectable()
export class SocketService {

  socketConnected$ = new BehaviorSubject<boolean>(false);
  private socket: io.Socket;

  constructor(private _log: LoggingService) {
    this.initSocket();
  }

  public initSocket(): void {
    this.socket = io(environment.socket.baseUrl, environment.socket.options);
    this.socket.on('connect', () => this.socketConnected$.next(true))
      .on('disconnect', () => this.socketConnected$.next(false));

    this.socketConnected$.asObservable()
        .subscribe(connected => this._log.log(`socket connected: ${JSON.stringify(connected)}`));
  }

  public send<T>(message: T, subject: string = 'message'): void {
    if (environment.socket.subjects.indexOf(subject) !== -1) {
      this._log.log(`emitting message: ${JSON.stringify({subject, message})}`);
      this.socket.emit(subject, message);
    }
  }

  public listen(subject: string = 'message'): Observable<any> {
    return new Observable(observer => {
      if (environment.socket.subjects.indexOf(subject) !== -1) {
        this.socket.on(subject, (data: any) =>  {
          this._log.log(`listening for message: ${JSON.stringify({subject, data})}`);
          observer.next(data);
        });
      }
      return () => {
        this.socket.off(subject);
      };
    });
  }

}
