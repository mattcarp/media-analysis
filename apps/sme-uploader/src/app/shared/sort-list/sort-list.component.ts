import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { UploaderService } from '../../services/uploader.service';

@Component({
  selector: 'app-sort-list',
  templateUrl: './sort-list.component.html',
  styleUrls: [
    '../../styles/_icons.scss',
    '../../styles/_buttons.scss',
    './sort-list.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortListComponent {
  @Input() disabledSort = false;
  isOpen = false;
  sortParams = {
    direction: 'asd',
    field: 'name',
  };

  constructor(
    private uploaderService: UploaderService,
  ) {}

  showList(): void {
    this.isOpen = true;
  }

  closeList(): void {
    this.isOpen = false;
  }

  sortedBy(field: string): boolean {
    return this.sortParams.field === field;
  }

  setSortedBy(field: string): void {
    this.sortParams.field = field;
    this.uploaderService.sortBy(field);
  }
}
