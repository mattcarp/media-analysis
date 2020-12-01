import { Component, EventEmitter, Input, Output } from '@angular/core';

import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: [
    '../../styles/_icons.scss',
    '../../styles/_buttons.scss',
    './list-view.component.scss',
  ],
})
export class ListViewComponent {
  @Input() isDisabled = false;
  @Output() listStyle = new EventEmitter();
  listViewStyle: 'list' | 'thumb';

  constructor(private helperService: HelperService) {
    this.listViewStyle =
      this.helperService.getTheme() === 'promo' ? 'list' : 'thumb';
  }

  setViewStyle(style: 'list' | 'thumb'): void {
    this.listViewStyle = style;
    this.listStyle.emit(style);
  }
}
