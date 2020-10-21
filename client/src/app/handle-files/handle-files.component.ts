import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'handle-files',
  templateUrl: './handle-files.component.html',
})
export class HandleFilesComponent implements AfterViewInit {
  @Output() files?: EventEmitter<any[]> = new EventEmitter();
  fileID: string;

  ngAfterViewInit(): void {
    const component = document.querySelector('sme-uploader');

    component.addEventListener('addedFiles', (event: Event) => {
      this.onSelect(event);
    });
  }

  onSelect(event: any): void {
    this.files.emit(event.detail);
  }
}
