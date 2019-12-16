import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { MediaContentType } from '../enums/media-content-type.enum';

@Injectable()
export class VideoService {

  video: any;

    constructor(
      private _common: CommonService
    ) {
      this.video = () => HTMLVideoElement;
    }

    streamUrl(name: string): string {
      return this._common.prepareUrl(name, MediaContentType.TvAdvert);
    }

    relativePathStreamUrl(relativePath: string): string {
      return this._common.prepareRelativeUrl(relativePath);
    }

}
