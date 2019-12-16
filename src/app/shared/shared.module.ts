import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MusicService } from './services/music.service';
import { ClientService } from './services/client.service';
import { ApiService } from './services/api.service';
import { CommonService } from './services/common.service';
import { SocketService } from './services/socket.service';
import { NotificationService } from './services/notification.service';
import { PlaylistHelperService } from './services/playlist-helper.service';
import { ArtworkService } from './services/artwork.service';
import { LoggingService } from './services/logging.service';
import { VideoService } from './services/video.service';

@NgModule({
  imports: [
    CommonModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        MusicService,
        ClientService,
        ApiService,
        CommonService,
        SocketService,
        PlaylistHelperService,
        NotificationService,
        ArtworkService,
        LoggingService,
        VideoService
        ]
    };
  }
}
