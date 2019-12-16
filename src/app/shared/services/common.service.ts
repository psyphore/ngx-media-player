import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { MediaContentType } from '../enums/media-content-type.enum';
import { environment } from '../../../environments/environment';

@Injectable()
export class CommonService {

  /**
   * Get moment object for given time
   * @param time {string} HH:mm:ss
   */
  momentInTime(time: string): moment.Moment {
    let timeObj = moment().hour(+time.split(':')[0])
      .minute(+time.split(':')[1])
      .second(+time.split(':')[2] || 0);
    return timeObj;
  }

  /**
   * Get estimated time arrival in milliseconds
   * @param from {string | Date | Moment} starting time
   * @param to {string | Date | Moment} ending time
   */
  millisecondsToGo(from: string | Date | moment.Moment, to: string | Date | moment.Moment): number {
    let diffTime = moment(to).unix() - moment(from).unix();
    let duration = moment.duration(diffTime * 1, 'seconds');
    return duration.asMilliseconds();
  }

  /**
   * Calulate milliseconds from .net time span value
   * @param durationTicks {number} .net time span value
   */
  calculateDurationTicks(durationTicks: number = 100000000): number {
    let duration = moment.duration(durationTicks / 10000, 'milliseconds');
    return duration.asMilliseconds();
  }

  /**
   * Build Moment DateTime Object
   * @param date {string} YYYY-MM-dd
   * @param time {string} HH:mm:ss
   */
  buildMomentDateTime(date: string, time: string): moment.Moment {
    let dmo = moment(date);
    let tmo = this.momentInTime(time);
    let mo = dmo.set({
      'hour': tmo.get('hour'),
      'minute': tmo.get('minute'),
      'second': tmo.get('second'),
    });
    return mo;
  }

  /**
   * Build a url for streaming content
   * @param fileName {string} item name to be streamed
   * @param type {MediaContentType} current item type
   */
  prepareUrl(fileName: string, type: MediaContentType): string {
    let path: string;

    switch (type) {
      case MediaContentType.Music:
      case MediaContentType.RadioAdvert:
      case MediaContentType.RadioDJ:
      case MediaContentType.StationImaging:
        path = `${environment.api.baseUrl}/playlist/stream/a/${fileName}`;
        break;

      case MediaContentType.TvAdvert:
        path = `${environment.api.baseUrl}/playlist/stream/v/${fileName}`;
        break;

      case MediaContentType.StillAdvert:
        path = `${environment.api.baseUrl}/playlist/artwork/${fileName}`;
        break;
    }

    return encodeURI(path);
  }

  prepareRelativeUrl(relativePath: string): string {
    return encodeURI(`${environment.api.baseUrl}/playlist/stream/${relativePath}`);
  }

}
