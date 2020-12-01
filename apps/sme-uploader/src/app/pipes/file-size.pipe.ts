import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettierBytes',
})
export class FileSizePipe implements PipeTransform {
  transform(num: number): string {
    if (typeof num !== 'number') {
      throw new TypeError('Expected a number, got ' + typeof num);
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
    const unit = units[exponent] || '';
    let res = Number(num / Math.pow(1024, exponent)).toFixed(1) + ' ' + unit;

    if (res === 'NaN ') {
      res = '0';
    }

    return res;
  }
}
