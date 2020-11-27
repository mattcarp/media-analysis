import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HelperService {
  sortFn(a: string, b: string, field: string): number {
    if (a[field] < b[field]) {
      return -1;
    }
    if (a[field] > b[field]) {
      return 1;
    }
    return 0;
  }

  informer(message: string): void {
    const info = document.getElementById('informer');
    const p = document.getElementById('informer-text');
    info.classList.add('show');
    p.innerText = message;
    setTimeout(() => info.classList.remove('show'), 3000);
  }
}
