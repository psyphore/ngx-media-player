import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePlaybackComponent } from './image-playback/image-playback.component';
import { VideoPlaybackComponent } from './video-playback/video-playback.component';
import { AudioPlaybackComponent } from './audio-playback/audio-playback.component';
import { NextMediaTimerComponent } from './next-media-timer/next-media-timer.component';
import { NoMediaComponent } from './no-media/no-media.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ImagePlaybackComponent,
    VideoPlaybackComponent,
    AudioPlaybackComponent,
    NextMediaTimerComponent,
    NoMediaComponent
  ],
  exports: [
    ImagePlaybackComponent,
    VideoPlaybackComponent,
    AudioPlaybackComponent,
    NextMediaTimerComponent,
    NoMediaComponent
  ]
})
export class MediaModule { }
