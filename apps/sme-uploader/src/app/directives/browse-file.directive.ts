import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appBrowseFile]',
})
export class BrowseFileDirective {
  @Output() fileBrowse = new EventEmitter<any>();

  @HostListener('click', ['$event']) onClick(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const isUploading = evt?.srcElement.getAttribute('isUploading');
    if (!isUploading) {
      document.getElementById('file-select').click();
    }
  }
}
