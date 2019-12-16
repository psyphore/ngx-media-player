import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription, Observable } from 'rxjs/Rx';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'mp-next-media-timer',
  template: `{{tick}}`,
  styles: []
})
export class NextMediaTimerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() millisecondsToGo: number = 0;
  @Input() interval: number = 1;
  @Input() unit: string = 'seconds';
  @Output() update: EventEmitter<string> = new EventEmitter<string>();
  tick: string;
  subscription: Subscription;

  ngOnInit() {
    // initialize some stuff here
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['millisecondsToGo'] &&
      changes['millisecondsToGo'].previousValue !== changes['millisecondsToGo'].currentValue &&
      changes['millisecondsToGo'].currentValue !== '' ||
      changes['millisecondsToGo'].currentValue !== 0) {
      this.countDown(this.millisecondsToGo, this.interval, this.unit);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private countDown(milliseconds: number, interval: number = 1, unit: string = 'seconds'): void {
    let timer = Observable.timer(1000, 1000);
    let localMilliseconds = milliseconds;
    let fmt = environment.dateTimeFormat.time;
    setTimeout(() => {
      this.subscription.unsubscribe();
      this.millisecondsToGo = 0;
      this.update.emit(this.tick);
      return;
    }, milliseconds);
    this.subscription = timer.subscribe(t => {
      let duration = moment.duration(moment.duration(localMilliseconds, 'milliseconds').asSeconds() - interval,
        <moment.unitOfTime.DurationConstructor>unit);
      localMilliseconds = duration.asMilliseconds();
      this.tick =
        `Next Item will start ${duration.humanize(true)}`;
    });
  }

}
