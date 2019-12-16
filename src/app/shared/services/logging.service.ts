import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class LoggingService {
  public info(content: any): void {
    if (!environment.debugging) return;
    console.info(content);
  }

  public log(content: any): void {
    if (!environment.debugging) return;
    console.log(content);
  }

  public warn(content: any): void {
    if (!environment.debugging) return;
    console.warn(content);
  }

  public error(content: any): void {
    if (!environment.debugging) return;
    console.error(content);
  }

  public tabular(content: any): void {
    if (!environment.debugging) return;
    console.table(content);
  }

}
