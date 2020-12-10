import { Component } from '@angular/core';

import { version } from '../../../../../package.json';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  verUI = version;

  constructor() {}
}
