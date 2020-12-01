import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
} from '@angular/core';

import { HelperService } from '../services/helper.service';

@Directive({
  selector: '[appDragDrop]',
})
export class DragDropDirective {
  @Output() fileDropped = new EventEmitter<any>();
  @ViewChild('smeuRoot') root: ElementRef;

  private active = false;
  private theme = this.helperService.getTheme();

  constructor(private helperService: HelperService) {}

  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.active = true;
    this.setClass(evt);

    if (this.theme !== 'promo') {
      this.setRootClass();
    }
  }

  @HostListener('dragleave', ['$event']) onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.active = false;
    this.setClass(evt);

    if (this.theme !== 'promo') {
      this.setRootClass();
    }
  }

  @HostListener('drop', ['$event']) ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.active = false;
    this.setClass(evt);

    const isUploading = this.getIsUploading(evt);
    const files = evt.dataTransfer.files;

    if (files.length > 0 && isUploading) {
      this.helperService.informer(
        'It is forbidden to add files during uploading',
      );
    }

    if (files.length > 0 && !isUploading) {
      this.fileDropped.emit(files);
    }

    if (this.theme !== 'promo') {
      this.setRootClass();
    }
  }

  @HostListener('click', ['$event']) onClick(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const isUploading = this.getIsUploading(evt);

    if (!isUploading || this.theme === 'promo') {
      document.getElementById('file-select').click();
    }
  }

  setClass(evt) {
    const isUploading = evt?.srcElement.getAttribute('isUploading');
    if (isUploading) {
      return;
    }
    this.setRootClass();
  }

  setRootClass() {
    const root = document.getElementById('smeu-root');
    const dropClass = 'smeu-drop-zone-active';

    this.active
      ? root?.classList?.add(dropClass)
      : root?.classList?.remove(dropClass);
  }

  getIsUploading(evt) {
    const currentAttribute =
      evt?.srcElement.getAttribute('isUploading') ||
      evt?.srcElement?.parentElement?.getAttribute('isUploading') ||
      evt?.srcElement?.parentElement?.parentElement?.getAttribute(
        'isUploading',
      );

    return currentAttribute === 'true';
  }
}
