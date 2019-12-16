import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';

import { environment } from '../environments/environment';

import { NotificationService } from './shared/services/notification.service';
import { ClientService } from './shared/services/client.service';
import { PlaylistHelperService } from './shared/services/playlist-helper.service';
import { CommonService } from './shared/services/common.service';

import { PlaylistSchedule } from './shared/models/playlist-schedule';
import { Playlist } from './shared/models/playlist';
import { MediaContent } from './shared/models/media-content';
import { SocketMessage } from './shared/models/socket-message';
import { ClientState } from './shared/models/client-state';

import { CommandType } from './shared/enums/command-type.enum';
import { MediaContentType } from './shared/enums/media-content-type.enum';
import { ClientStateType } from './shared/enums/client-state-type.enum';
import { LoggingService } from './shared/services/logging.service';
import { AudioPlaybackComponent } from './media/audio-playback/audio-playback.component';
import { VideoPlaybackComponent } from './media/video-playback/video-playback.component';

@Component({
  selector: 'mp-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('stage') stage: ElementRef;
  @ViewChild('mpap') audioPlayer: AudioPlaybackComponent;
  @ViewChild('mpvp') videoPlayer: VideoPlaybackComponent;

  public playlistSchedule: PlaylistSchedule;
  public currentPlaylist: Playlist;
  public currentPlay: MediaContent;
  public defaultArtwork: string;
  public nextMediaCounter: string;
  public millisecondsToGo: number;
  public isPlaying: boolean;
  public isWaiting: boolean;
  public hasNoMedia: boolean;
  public apiConnection: boolean;
  public debugging: boolean;
  private noTrackInterval: any;

  constructor(
    private _clientService: ClientService,
    private _playlistHelper: PlaylistHelperService,
    private _commonService: CommonService,
    private _notifications: NotificationService,
    private _log: LoggingService
  ) {}

  ngOnInit(): void {
    this.resetLocals();
    this._notifications.connectionStatus.subscribe(connected =>
      this.handleSocketConnection(connected)
    );
    this._notifications.listen().subscribe(message =>
      this.handleBroadcast(message)
    );
  }

  getTodaysPlaylist(): void {
    this.resetLocals();
    this._playlistHelper.LoadTodaysPlaylist().subscribe(playlist => {
        this.defaultArtwork = environment.defaultArtwork;
        this.playlistSchedule = this._playlistHelper.getSchedule();
        if (playlist) {
          this.currentPlaylist = playlist;
          this._playlistHelper.setIsFirstPlay();
          this._playlistHelper.setHibernation(false);
          this.handleNextItem();
          return;
        } else {
          this.handleNextPlaylist();
        }
      },
      err => {
        this.apiConnection =
          err && err === 'Response with status: 0  for URL: null';
        this.handleNoPlaylist();
      }
    );
  }

  handleNextItem() {
    let nextItem: MediaContent;
    this._playlistHelper.setPlay(false);
    if (this._playlistHelper.getIsFirstPlay()) {
      this._playlistHelper.setIsFirstPlay(false);
      nextItem = this._playlistHelper.scrubPlaylist(this.currentPlaylist);
    } else {
      nextItem = this._playlistHelper.getNextItem(this.currentPlaylist);
    }
    this.currentPlaylist = this._playlistHelper.getPlaylist();
    this.processNextItem(nextItem);
  }

  processNextItem(nextItem: MediaContent): void {
    this.currentPlay = null;
    if (nextItem) {
      let playback = this.getClientState(nextItem.name);
      this._clientService.currentPlay(playback);
      this.ensureCurrentItemOffTheList(nextItem);
      this._playlistHelper.setPlay();
      this.currentPlay = nextItem;
      this.updatePlayingStatus();
    } else {
      this.handleNextPlaylist();
    }
  }

  handleFinish(e: any): void {
    this.handleNextItem();
  }

  handleTimerUpdates(e: string) {
    this.nextMediaCounter = e;
  }

  isAudio(nextItem: MediaContent): boolean {
    return (
      (nextItem && nextItem.mediaType === MediaContentType.Music) ||
      nextItem.mediaType === MediaContentType.RadioAdvert ||
      nextItem.mediaType === MediaContentType.StationImaging ||
      nextItem.mediaType === MediaContentType.RadioDJ
    );
  }

  isVideo(nextItem: MediaContent): boolean {
    return nextItem && nextItem.mediaType === MediaContentType.TvAdvert;
  }

  handleNextPlaylist(): void {
    this._playlistHelper.setHibernation();
    this.millisecondsToGo = null;

    this.currentPlaylist = this._playlistHelper.getNextPlaylist();
    this.updatePlayingStatus();
    if (!this.currentPlaylist) {
      this.handleNoPlaylist();
      return;
    }

    this._clientService.currentPlay(this.getClientState());
    let playlistStartAt = this._commonService.buildMomentDateTime(
      this.currentPlaylist.date,
      this.currentPlaylist.startTime
    );
    this.millisecondsToGo = this._commonService.millisecondsToGo(
      moment(),
      playlistStartAt
    );
    this.noTrackInterval = setTimeout(() => {
      this.noTrackInterval = null;
      this.millisecondsToGo = null;
      this.handleNextItem();
    }, this.millisecondsToGo);
  }

  handleNoPlaylist(): void {
    this._playlistHelper.setHibernation();
    this._clientService.currentPlay(this.getClientState());
    this.noTrackInterval = setTimeout(() => {
      this.noTrackInterval = null;
      this.resetLocals();
      this.getTodaysPlaylist();
    }, environment.intervals.noPlaylist);
  }

  getClientState(currentItemName?: string): ClientState {
    let clientState = new ClientState(
      currentItemName ? ClientStateType.InPlay : ClientStateType.Hibernating,
      environment.version,
      this.currentPlaylist ? this.currentPlaylist.playlistName || null : null,
      this.playlistSchedule ? this.playlistSchedule.name || null : null,
      currentItemName || 'Hibernating',
      this.currentPlaylist ? this.currentPlaylist.endTime || null : null,
      this.currentPlaylist ? this.currentPlaylist.endTimeTicks || 0 : 0,
      this.currentPlaylist ? this.currentPlaylist.startTime || null : null,
      this.currentPlaylist ? this.currentPlaylist.startTimeTicks || 0 : 0,
      this.playlistSchedule ? this.playlistSchedule.version || 0 : 0,
      moment().format(),
      environment.debugging
    );

    return clientState;
  }

  ensureCurrentItemOffTheList(item: MediaContent): void {
    let cleanList = this.currentPlaylist.items.filter(track => {
      return !(
        track.name === item.name &&
        track.scheduledStartTime === item.scheduledStartTime
      );
    });
    this.currentPlaylist.items = cleanList;
  }

  private resetLocals(): void {
    this.currentPlay = null;
    this.noTrackInterval = null;
    this.currentPlaylist = null;
    this.playlistSchedule = null;
    this.isPlaying = false;
    this.isWaiting = false;
    this.hasNoMedia = false;
    this.defaultArtwork = environment.defaultArtwork;
    this.debugging = environment.debugging;
    this.updatePlayingStatus();
  }

  private updatePlayingStatus(): void {
    this.isPlaying = this._playlistHelper.getPlay();
    this.hasNoMedia =
      !this.isPlaying &&
      !(this.currentPlaylist && this.currentPlaylist.items.length !== 0);
    this.isWaiting =
      !this.isPlaying &&
      (this.currentPlaylist && this.currentPlaylist.items.length !== 0);
  }

  private handleBroadcast(message: SocketMessage | any): void {
    if (message && message.subject) {
      switch (message.subject) {
        case 'current play':
          this._log.log(`current play: ${JSON.stringify(message.body)}`);
          break;

        case 'refresh':
          location.reload(true);
          break;

        case 'playlist':
          if (
            <CommandType>message.body.action === CommandType.ReloadPlaylists
          ) {
            this.unloadCurrentMedia();
            this.getTodaysPlaylist();
          }
          break;

        case 'message':
          this._log.log(`message: ${JSON.stringify(message.body)}`);
          break;

        case 'debug':
          this._log.log(`debug mode: ${JSON.stringify(message.body)}`);
          environment.debugging = message.body;
          break;
      }
    } else {
      this._log.log(`anything: ${JSON.stringify(message)}`);
    }
  }

  private handleSocketConnection(connected: boolean): void {
    if (connected) {
      this.getTodaysPlaylist();
    } else {
      this.unloadCurrentMedia();
    }
    this.apiConnection = connected;
    this.sanityCheck();
  }

  private unloadCurrentMedia(): void {
    // stop currently playing media via '#' component accessor
    if (this.currentPlay && this.isAudio(this.currentPlay)) {
      this.audioPlayer.unloadCurrentTrack();
      return;
    }

    if (this.currentPlay && this.isVideo(this.currentPlay)) {
      this.videoPlayer.unloadCurrentClip();
      return;
    }
  }

  private sanityCheck(): void {
    // if no playlist && apiConnection still false
    if (!this.currentPlay && !this.apiConnection) {
      let sc = setTimeout(() => {
        clearTimeout(sc);
        this.ngOnInit();
      }, environment.intervals.noPlaylist);
    }
  }
}
