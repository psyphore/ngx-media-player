import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { Observable } from 'rxjs/Observable';
import { MediaContentType } from '../enums/media-content-type.enum';
import { ApiService } from './api.service';

@Injectable()
export class ArtworkService {

  artwork: any;

  constructor(
    private _common: CommonService,
    private apiService: ApiService
  ) {
    this.artwork = () => HTMLImageElement;
  }

  streamUrl(name: string): string {
    return this._common.prepareUrl(name, MediaContentType.StillAdvert);
  }

  relativePathStreamUrl(relativePath: string): string {
    return this._common.prepareRelativeUrl(relativePath);
  }

  public getAvailableStillAds(): Observable<string[]> {
    return this.apiService.getAvailableArtwork<string[]>();
  }

}
