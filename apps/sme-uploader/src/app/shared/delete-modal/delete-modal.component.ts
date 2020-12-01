import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  templateUrl: 'delete-modal.component.html',
  styleUrls: ['delete-modal.component.scss', '../../styles/_buttons.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteModalComponent implements OnChanges {
  @Input() options;

  title = 'File(s) will be deleted';
  bodyText = 'Are you sure ? ';
  isRemoveAll = false;

  @Output() canDeleteEvent = new EventEmitter();

  constructor() {}

  ngOnChanges(): void {
    this.title = this.options.title ?? this.title;
    this.bodyText = this.options.bodyText ?? this.bodyText;
  }

  onYesClick(): void {
    this.canDeleteEvent.emit({
      allowToRemove: true,
      isRemoveAll: this.options?.parameters?.isRemoveAll,
      fileId: this.options?.parameters?.fileId,
    });
  }

  onNoClick(): void {
    this.canDeleteEvent.emit({
      allowToRemove: false,
      isRemoveAll: this.isRemoveAll,
      fileId: this.options.fileId,
    });
  }
}
