import { Injectable } from '@angular/core';
import { MediaContentType } from '../enums/media-content-type.enum';
import { CommonService } from './common.service';

@Injectable()
export class MusicService {

  constructor(
    private _common: CommonService
  ) {}

  streamUrl(name: string): string {
    return this._common.prepareUrl(name, MediaContentType.Music);
  }

  relativePathStreamUrl(relativePath: string): string {
    return this._common.prepareRelativeUrl(relativePath);
  }

/**
 * Format time for currently playing resource
 * @param seconds {number} current time for the resource
 */
  formatTime(seconds: number) {
    let uiMins: string;
    let uiSecs: string;
    let minutes: number = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    if (isNaN(seconds)) {
      minutes = 0;
      seconds = 0;
    }

    uiMins = (minutes >= 10) ? minutes.toString() : `0${minutes}`;

    uiSecs = (seconds >= 10) ? seconds.toString() : `0${seconds}`;

    return `${uiMins} : ${uiSecs}`; // 00:00
  }

}
