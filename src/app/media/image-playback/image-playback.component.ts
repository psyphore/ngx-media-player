import { Component, OnInit, Input} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { ArtworkService } from '../../shared/services/artwork.service';

@Component({
  selector: 'mp-image-playback',
  template: `
  <div class="advert"
       [ngStyle]="{ 'background-image': 'url(' + advertImage + ')'}">
  </div>
  `,
  styles: [
    `
    .advert {
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      position: fixed;
      bottom: 0;
      right: 0;
      min-width: 100vw;
      min-height: 100vh;
      z-index: -10;
  }
    `
  ]
})
export class ImagePlaybackComponent implements OnInit {
  @Input() duration: number = environment.intervals.defaultArtwork;
  animateArtwork: any;
  advertImage: string;
  timeout: any;

  constructor(
    private _artworkService: ArtworkService,
    private _sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this._artworkService.getAvailableStillAds()
    .subscribe(col => this.ArrLoop(col, this.fadeIn, this.duration, true));
  }

  fadeIn(url: string): any {
    return {
      'background': `url(${url}) no-repeat center center fixed`,
      'position': 'fixed',
      'right': '0',
      'bottom': '0',
      'width': '100vw',
      'height': '100vh',
      'z-index': '-10',
      'background-size': 'cover'
    };
  }

  ArrLoop(arr: Array<any>, callback: any, delay: number, infinate: boolean = false): void {
    let i: number = 0, total: number = arr.length - 1;
    let loop = () => {
      clearTimeout(this.timeout);
      this.advertImage = this._artworkService.relativePathStreamUrl('stillAdvert\\'+arr[i]);
      if (i < total) {
        i++;
      } else {
        if (!infinate) return;
        i=0;
      }
      this.timeout = setTimeout(loop, delay);
    };
    loop();
  }

}
