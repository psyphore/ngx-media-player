import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { MusicService } from '../../shared/services/music.service';
import { ArtworkService } from '../../shared/services/artwork.service';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'mp-audio-playback',
  template: `
  <div class="flex-container message">
  <audio #audioPlayer>
    Your browser does not support the audio element
  </audio>
  <ul class="flex-item" *ngIf="debug">
    <li>
      <small>{{file}}</small>
    </li>
    <li>
      <small>{{volume}}%</small>
    </li>
    <li>
      <div class="progress">
        <span class="player__time-elapsed">
          {{elapsed}}
        </span>
        <span class="player__time-total">
          of {{duration}}
        </span>
      </div>
    </li>
  </ul>
</div>
  `
})
export class AudioPlaybackComponent implements OnInit, OnChanges {
  @Input() file: string;
  @Input() relativePath: string;
  @Input() volume: number = 40;
  @Input() debug: boolean = false;
  @ViewChild('audioPlayer') audioPlayer: HTMLAudioElement;
  @Output() finish: EventEmitter<boolean> = new EventEmitter<boolean>();
  position: number;
  elapsed: string;
  duration: string;
  constructor(
    private _musicService: MusicService
  ) { }

  ngOnInit() {
    this.initializeElementEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['debug'] &&
      changes['debug'].currentValue &&
      changes['debug'].previousValue !== changes['debug'].currentValue) {
      console.log('Debugging ',this.debug);
    }

    if (changes && changes['relativePath'] &&
      changes['relativePath'].previousValue !== changes['relativePath'].currentValue &&
      changes['relativePath'].currentValue !== '') {
      setTimeout(() => {
        let supported = environment.supportedMediaExtensions.some(s => (<string>changes['relativePath'].currentValue).indexOf(s) !== -1);
        if (!supported) {
          this.finish.emit(true);
          return;
        }

        this.loadNextTrack(changes['relativePath'].currentValue);
      }, 0);
    }
  }

  initializeElementEvents(): void {
    this.audioPlayer = new Audio();
    this.audioPlayer.onended = (p: any) => { this.finish.emit(true); };
    this.audioPlayer.ontimeupdate = (p: any) => { this.handlePlaybackDurationDisplay(); };
  }

  handlePlaybackDurationDisplay(): void {
    const elapsed = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration;
    this.position = elapsed / duration;
    this.elapsed = this._musicService.formatTime(elapsed);
    this.duration = this._musicService.formatTime(duration);
  }

  loadNextTrack(currentFile: string, relative: boolean = true): void {
    this.audioPlayer.src = relative ? this._musicService.relativePathStreamUrl(currentFile) : this._musicService.streamUrl(currentFile);
    this.audioPlayer.load();
    this.audioPlayer.volume = (this.volume / 100);
    this.audioPlayer.play();
  }

  public unloadCurrentTrack(): void {
    this.audioPlayer.pause();
    this.audioPlayer.src = '';
    this.audioPlayer.load();
  }
}
