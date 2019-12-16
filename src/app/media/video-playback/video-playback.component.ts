import { Component, ViewChild, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef } from '@angular/core';
import { VideoService } from '../../shared/services/video.service';
import { ArtworkService } from '../../shared/services/artwork.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'mp-video-playback',
  template: `
  <div class="video">
    <video id="backgroundvid" #videoPlayer>
      Browser not supported
    </video>
  </div>
  `,
  styles: [`
  video#backgroundvid {
    background: url('') no-repeat center center fixed;
    position: fixed;
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: 10;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -ms-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }

  .video {
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
  }
  `]
})
export class VideoPlaybackComponent implements OnInit, OnChanges {
  @Input() file: string;
  @Input() relativePath: string;
  @Input() volume: number = 40;
  @Input() poster: string;
  @ViewChild('videoPlayer') videoPlayer: ElementRef;
  @Output() finish: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    private _videoService: VideoService,
    private _artwork: ArtworkService
  ) { }

  ngOnInit() {
    // do some cool inits here
    this.initializeElementEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes && changes['file'] &&
    //   changes['file'].currentValue &&
    //   changes['file'].previousValue !== changes['file'].currentValue) {
    //   setTimeout(() => {
    //     let supported = environment.supportedMediaExtensions.some(s => (<string>changes['file'].currentValue).indexOf(s) !== -1);
    //     if (!supported) {
    //       this.finish.emit(true);
    //       return;
    //     }

    //     this.loadNextClip(changes['file'].currentValue);
    //   }, 0);
    // }

    if (changes && changes['relativePath'] &&
      changes['relativePath'].previousValue !== changes['relativePath'].currentValue &&
      changes['relativePath'].currentValue !== '') {
      setTimeout(() => {
        let supported = environment.supportedMediaExtensions.some(s => (<string>changes['relativePath'].currentValue).indexOf(s) !== -1);
        if (!supported) {
          this.finish.emit(true);
          return;
        }

        this.loadNextClip(changes['relativePath'].currentValue);
      }, 0);
    }
  }

  initializeElementEvents(): void {
    this.videoPlayer.nativeElement.onended = (p: any) => { this.finish.emit(true); };
  }

  loadNextClip(currentFile: string, relative: boolean = true): void {
    this.videoPlayer.nativeElement.poster = this._artwork.streamUrl(this.poster);
    this.videoPlayer.nativeElement.src = relative ?
                                         this._videoService.relativePathStreamUrl(currentFile) :
                                         this._videoService.streamUrl(currentFile);
    this.videoPlayer.nativeElement.volume = (this.volume / 100);
    this.videoPlayer.nativeElement.play();
  }

  unloadCurrentClip(): void {
    this.videoPlayer.nativeElement.pause();
    this.videoPlayer.nativeElement.poster = '';
    this.videoPlayer.nativeElement.src = '';
    this.videoPlayer.nativeElement.load();
  }

}
