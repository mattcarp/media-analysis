import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appInputUploader]',
})
export class InputUploaderDirective {
  @Output() filesChosen = new EventEmitter<any>();

  @HostListener('change', ['$event']) onChange(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.filesChosen.emit(ev?.target?.files);
    if (ev?.target?.value) {
      ev.target.value = '';
    }
  }
}
