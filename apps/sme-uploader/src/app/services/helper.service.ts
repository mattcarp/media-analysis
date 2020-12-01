import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HelperService {
  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];
  theme: string;

  sortFn(a: object, b: object, field: string): number {
    if (a[field] < b[field]) {
      return -1;
    }
    if (a[field] > b[field]) {
      return 1;
    }
    return 0;
  }

  clockFormat(seconds: number, decimals: number): string {
    let hours;
    let minutes;
    let secs;
    let result;

    if (!seconds) {
      return '00:00';
    }

    hours = parseInt(String(seconds / 3600), 10) % 24;
    minutes = parseInt(String(seconds / 60), 10) % 60;
    secs = seconds % 60;
    secs = secs.toFixed(decimals);

    if (secs >= 60) {
      minutes++;
      secs -= 60;
      secs = secs.toFixed(decimals);
    }

    result =
      (hours < 10 ? '0' + hours : hours) +
      ':' +
      (minutes < 10 ? '0' + minutes : minutes) +
      ':' +
      (secs < 10 ? '0' + secs : secs);

    return result;
  }

  getTimeLeft(
    totalSize: number,
    totalUploaded: number,
    bytesPerSecond: number,
  ): string {
    if (!bytesPerSecond) {
      return '00:00';
    }
    const remainingBytes = totalSize - totalUploaded;
    const seconds = remainingBytes / (bytesPerSecond * 1000);

    return this.clockFormat(seconds, 0);
  }

  getUploaderState(fileList): 'loading' | 'ready' | 'paused' {
    const loading = fileList.find((file) => file.status === 'loading');
    const paused = fileList.find((file) => file.status === 'paused');

    return loading ? 'loading' : paused ? 'paused' : 'ready';
  }

  getUploadedSize(totalSize, fileList, currentBytesUploaded): number {
    const totalUploaded = fileList
      .filter((file) => file.status === 'success')
      .reduce((accumulator, currentFile) => {
        return accumulator + currentFile.size;
      }, currentBytesUploaded);

    if (totalUploaded > totalSize) {
      return totalSize;
    }
    return totalUploaded;
  }

  getUploadSpeed(startedAt, currentBytesUploaded): number {
    if (!startedAt) {
      return 0;
    }
    const secondsElapsed = (new Date().getTime() - startedAt.getTime()) / 1000;
    const bytesPerSecond = secondsElapsed
      ? currentBytesUploaded / secondsElapsed
      : 0;

    return Math.floor(bytesPerSecond / 1000);
  }

  getID(): string {
    return '_' + Math.random().toString(36).substr(2, 19);
  }

  getIconByMime(fileType): any {
    const archiveTypes = this.getArchiveTypes();
    const iconChoices = this.getIconChoices();

    if (!fileType) {
      return iconChoices.default;
    }

    const fileTypeGeneral = fileType.split('/')[0];
    const fileTypeSpecific = fileType.split('/')[1];

    if (
      fileTypeGeneral === 'application' &&
      archiveTypes.includes(fileTypeSpecific)
    ) {
      return iconChoices.archive;
    }

    if (iconChoices[fileTypeGeneral]) {
      return iconChoices[fileTypeGeneral];
    }

    return iconChoices.default;
  }

  // todo need to be rewritten in the component
  informer(message: string): void {
    const infoContainer = document.getElementById('smeu-informer');
    const pContainer = document.getElementById('smeu-informer-text');
    if (infoContainer) {
      infoContainer?.classList?.add('show');
      if (pContainer) {
        pContainer.innerText = message;
      }

      setTimeout(() => infoContainer?.classList?.remove('show'), 3000);
    }
  }

  setTheme(theme: string): void {
    this.theme = theme;
  }

  getTheme(): string {
    return this.theme;
  }

  getResizeClass(offsetWidth): string {
    if (offsetWidth > 576 && offsetWidth <= 768) {
      return 'smeu-size-sm';
    }
    if (offsetWidth > 768 && offsetWidth <= 1024) {
      return 'smeu-size-md';
    }
    if (offsetWidth > 1024 && offsetWidth <= 1200) {
      return 'smeu-size-lg';
    }
    if (offsetWidth > 1200) {
      return 'smeu-size-xl';
    }
  }

  removeFromLocalstorage(upload): void {
    if (!upload) {
      return;
    }
    Object.keys(localStorage).map((key) => {
      if (JSON.parse(localStorage.getItem(key))?.uploadUrl === upload.url) {
        localStorage.removeItem(key);
      }
    });
  }

  getIconChoices(): any {
    return {
      default: {
        color: '#cad1dd',
        icon: 'file',
      },
      text: {
        color: '#bec8d2',
        icon: 'text',
      },
      image: {
        color: '#c2c3e9',
        icon: 'image',
      },
      audio: {
        color: '#9ec6d7',
        icon: 'audio',
      },
      video: {
        color: '#a7ddc0',
        icon: 'video',
      },
      pdf: {
        color: '#e3beba',
        icon: 'pdf',
      },
      application: {
        color: '#e3beba',
        icon: 'pdf',
      },
      archive: {
        color: '#bdd998',
        icon: 'archive',
      },
    };
  }

  private getArchiveTypes(): string[] {
    return [
      'zip',
      'x-7z-compressed',
      'x-rar-compressed',
      'x-gtar',
      'x-apple-diskimage',
      'x-diskcopy',
    ];
  }
}
