import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrettierBytesService {
  prettierBytes(num: number): string {
    let newNum: number;

    if (typeof num !== 'number') {
      throw new TypeError('Expected a number, got ' + typeof num);
    }

    const neg = num < 0;
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    if (neg) {
      newNum = -num;
    }

    if (newNum < 1) {
      return (neg ? '-' : '') + num + ' B';
    }

    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
    newNum = Number(num / Math.pow(1024, exponent));
    const unit = units[exponent];

    if (num >= 10 || num % 1 === 0) {
      // Do not show decimals when the number is two-digit, or if the number has no decimal component.
      return (neg ? '-' : '') + newNum.toFixed(0) + ' ' + unit;
    }

    return (neg ? '-' : '') + newNum.toFixed(1) + ' ' + unit;
  }
}
