import { Component, Input } from '@angular/core';

@Component({
  selector: 'mp-no-media',
  template: `<span class="no-media-msg">{{message}}</span>`
})

export class NoMediaComponent {
  @Input() message: string = 'No media found';
}
