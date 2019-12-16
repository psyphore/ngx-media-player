import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, Subscriber } from 'rxjs/Rx';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';

import { PlaylistSchedule } from '../models/playlist-schedule';
import { Playlist } from '../models/playlist';
import { MediaContent } from '../models/media-content';

import { CommonService } from './common.service';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable()
export class PlaylistHelperService {
  private _schedule: PlaylistSchedule;
  private _playlist: Playlist;
  private _isHibernating: boolean;
  private _isPlaying: boolean;
  private _inPlayIndex: number = 0;
  private _isFirstPlay: boolean;
  private _showCountDownToNextItem: boolean;

  constructor(
    private _common: CommonService,
    private _apiService: ApiService,
    private _notify: NotificationService
  ) {}

  getSchedule(): PlaylistSchedule {
    return this._schedule;
  }

  getScheduleVersion(): number {
    return this.getSchedule() ? this.getSchedule().version : 0;
  }

  getPlaylist(): Playlist {
    return this._playlist;
  }

  setPlay(playing: boolean = true) {
    this._isPlaying = playing;
  }

  getPlay(): boolean {
    return this._isPlaying;
  }

  setHibernation(sleep: boolean = true) {
    this._isHibernating = sleep;
  }

  getHibernation(): boolean {
    return this._isHibernating;
  }

  getInPlayIndex(): number {
    return this._inPlayIndex;
  }

  getIsFirstPlay(): boolean {
    return this._isFirstPlay;
  }

  setIsFirstPlay(play: boolean = true): void {
    this._isFirstPlay = play;
  }

  setNextItemEta(count: boolean = true): void {
    this._showCountDownToNextItem = count;
  }

  getNextItemEta(): boolean {
    return this._showCountDownToNextItem;
  }

  LoadTodaysPlaylist(): Observable<Playlist> {
    return new Observable(observer => {
      this.broadcastActivity('Getting latest playlist schedule...');
      this.getAvailablePlaylists()
          .subscribe(schedule => this.processSchedule(schedule, observer),
                     err => this.processScheduleError(err, observer));
    });
  }

  scrubPlaylist(playlist: Playlist): MediaContent {
    this.broadcastActivity('Scrubbing playlist.');
    let skippedTracks = this.scrub(playlist);
    this.logSkippedTracks(skippedTracks);
    // remove items that have been scrubed
    let item = this._playlist.items[this._inPlayIndex];
    this._playlist.items = this.processExpiredPlaylistItems(skippedTracks);
    return item;
  }

  scrub(playlist: Playlist): MediaContent[] {
    let skippedTracks: MediaContent[] = [];
    let timeOffset = moment().milliseconds(-environment.intervals.millisecondOffset);
    for (let i = 0; i < playlist.items.length; i++) {
      let track = playlist.items[i];
      this._inPlayIndex = i;
      let trackStartTime = this._common.momentInTime(track.scheduledStartTime);
      let trackEndTime = this._common.momentInTime(track.scheduledEndTime);
      if (timeOffset.isBetween(trackStartTime, trackEndTime)) {
        this._inPlayIndex = ((this._inPlayIndex - 1) <= 0) ? 0 : this._inPlayIndex--;
        this.setNextItemEta(false);
        break;
      }
      if (timeOffset.isBefore(trackStartTime)) {
        this._inPlayIndex = ((this._inPlayIndex - 1) <= 0) ? 0 : this._inPlayIndex--;
        this.setNextItemEta(true);
        break;
      }
      skippedTracks.push(track);
    }

    if (skippedTracks.length !== playlist.items.length) {
      this.broadcastActivity(`Playing: ${playlist.items[this._inPlayIndex].name}`);
    } else {
      this.broadcastActivity(`Playlist items have expired.`);
      this._inPlayIndex = playlist.items.length + 1;
    }
    return skippedTracks;
  }

  processExpiredPlaylistItems(skippedTracks: MediaContent[]): MediaContent[] {
    this.broadcastActivity('Process expired playlist items.');
    let valid = this._playlist.items.filter((track: MediaContent) => {
      return !(skippedTracks.some(st => st.name === track.name &&
        st.scheduledStartTime === track.scheduledStartTime));
    });

    return valid;
  }

  getNextItem(playlist: Playlist): MediaContent {
    const nextNumber = 0;
    const item = playlist.items[nextNumber];

    this._playlist.items = playlist.items.filter((track: MediaContent) => {
      return !(track.name === item.name &&
        track.scheduledStartTime === item.scheduledStartTime);
    });

    return item;
  }

  sortSchedule(schedule: PlaylistSchedule): PlaylistSchedule {
    this.broadcastActivity('Sort Schedule playlists');
    let sortedSchedule: PlaylistSchedule;
    sortedSchedule = schedule;
    sortedSchedule.playlists = schedule.playlists.sort((prev, nxt): number => {
      let p = this._common.buildMomentDateTime(prev.date, prev.startTime);
      let n = this._common.buildMomentDateTime(nxt.date, nxt.startTime);
      if (p.isBefore(n)) return -1;
      if (p.isAfter(n)) return 1;
      return 0;
    });

    return sortedSchedule;
  }

  sortPlaylist(playlist: Playlist): Playlist {
    this.broadcastActivity('Sort Playlist items.');
    let sortedPlaylist: Playlist;
    sortedPlaylist = playlist;
    if (playlist) {
      sortedPlaylist.items = playlist.items.sort((prev, nxt): number => {
        let p = this._common.buildMomentDateTime(playlist.date, prev.scheduledStartTime);
        let n = this._common.buildMomentDateTime(playlist.date, nxt.scheduledStartTime);
        if (p.isBefore(n)) return -1;
        if (p.isAfter(n)) return 1;
        return 0;
      });
    }
    return sortedPlaylist;
  }

  getActivePlaylist(schedule: PlaylistSchedule): Playlist {
    this.broadcastActivity('Get active playlist.');
    let now = moment();
    let unplayedPlaylists = schedule.playlists.filter((item: Playlist) => {
      let playlistDate = moment(item.date);
      let forToday = playlistDate.isSame(now, 'day');
      let playlistStartTime = this._common.momentInTime(item.startTime);
      let playlistEndTime = this._common.momentInTime(item.endTime);
      let okay = now.isBetween(playlistStartTime, playlistEndTime);
      return (forToday && okay);
    });

    const nextNumber = 0;
    this._playlist = this.sortPlaylist(unplayedPlaylists[nextNumber]);
    return this._playlist;
  }

  getActiveSchedule(schedule: PlaylistSchedule): PlaylistSchedule {
    this.broadcastActivity('Get Active Schedule.');
    let now = moment();
    let scheduleMonth = moment(schedule.month, 'MMMM');
      let thisMonth = scheduleMonth.isSame(now, 'month');
      let scheduleStartTime = this._common.momentInTime(schedule.startTime);
      let scheduleEndTime = this._common.momentInTime(schedule.endTime);
      let okay = now.isBetween(scheduleStartTime, scheduleEndTime);
      if (thisMonth && okay) {
        this._schedule = schedule;
      }

      return this._schedule;
  }

  getNextPlaylist(): Playlist {
    this.broadcastActivity('Get next playlist.');
    let schedule = this.getSchedule();
    if (schedule && schedule.playlists) {
      // there are more playlists coming
      let nextPlaylists = schedule.playlists.filter((item: Playlist) => {
        let psdt = this._common.buildMomentDateTime(item.date, item.startTime);
        let forNext = psdt.isAfter(moment());
        return (forNext);
      });
      const nextNumber = 0;
      this._schedule.playlists = nextPlaylists;
      this._playlist = this._schedule.playlists[nextNumber];
    }

    return this.getPlaylist();
  }

  private processScheduleError(err: any, observer: Subscriber<any>): void {
    this.broadcastActivity(`An error occured while fetching next playlist. ${err}`, 'error');
    observer.error(err);
  }

  private processSchedule(schedule: PlaylistSchedule, observer: Subscriber<any>): void {
    this._playlist = null;
    this._schedule = null;
    this._schedule = this.getActiveSchedule(schedule);
    if (this._schedule && this._schedule.playlists.length !== 0) {
      this.broadcastActivity('Got latest playlist schedule...');
      this._schedule = this.sortSchedule(this._schedule);
      this.broadcastActivity('Getting today\'s playlist...');
      this._playlist = this.getActivePlaylist(this._schedule);

      if (!this._playlist || this._playlist.items.length === 0) {
        this.broadcastActivity('Today\'s playlist could not be found.');
        observer.next(this._playlist);
        return;
      }
      this.broadcastActivity('Today\'s playlist was found.');
      observer.next(this._playlist);
    } else {
      this.broadcastActivity('Schedule was not found or it does not contain any playlists.');
      observer.next(this._playlist);
    }
  }

  private logSkippedTracks(tracks: MediaContent[]): void {
    let itemString = '';
    tracks.forEach((track: MediaContent) => {
      itemString += `${track.name} was skipped.\n`;
    });
    this.broadcastActivity(itemString);
  }

  private getAvailablePlaylists (): Observable<PlaylistSchedule> {
    this.broadcastActivity('Get available schedule from API.');
    return this._apiService.getAvailablePlaylist<PlaylistSchedule>();
  }

  private broadcastActivity(message: string, subject: string = 'general'): void {
    this._notify.send({subject: subject ,body: message});
  }
}
