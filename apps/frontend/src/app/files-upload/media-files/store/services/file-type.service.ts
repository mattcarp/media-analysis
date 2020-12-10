import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileTypeService {
  getFileType(file: File): string {
    let fileExtension = file.name
      ? this.getFileNameAndExtension(file.name).extension
      : null;
    fileExtension = fileExtension ? fileExtension.toLowerCase() : null;

    if (file.type) {
      // if mime type is set in the file object already, use that
      return file.type;
    }

    if (fileExtension && this.mimeTypes[fileExtension]) {
      // else, see if we can map extension to a mime type
      return this.mimeTypes[fileExtension];
    }

    // if all fails, fall back to a generic byte stream type
    return 'application/octet-stream';
  }

  getFileNameAndExtension(fullFileName: string): { extension: string; name: string } {
    const lastDot = fullFileName.toString().lastIndexOf('.');
    // these count as no extension: "no-dot", "trailing-dot."
    if (lastDot === -1 || lastDot === fullFileName.length - 1) {
      return {
        name: fullFileName,
        extension: undefined,
      };
    }

    return {
      name: fullFileName.slice(0, lastDot),
      extension: fullFileName.slice(lastDot + 1),
    };
  }

  // Source -- https://github.com/jshttp/mime-db/blob/master/db.json
  mimeTypes = {
    md: 'text/markdown',
    markdown: 'text/markdown',
    mp4: 'video/mp4',
    mp3: 'audio/mp3',
    flac: 'audio/x-flac',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    tab: 'text/tab-separated-values',
    avi: 'video/x-msvideo',
    mks: 'video/x-matroska',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    doc: 'application/msword',
    docm: 'application/vnd.ms-word.document.macroenabled.12',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dot: 'application/msword',
    dotm: 'application/vnd.ms-word.template.macroenabled.12',
    dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    xla: 'application/vnd.ms-excel',
    xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
    xlc: 'application/vnd.ms-excel',
    xlf: 'application/x-xliff+xml',
    xlm: 'application/vnd.ms-excel',
    xls: 'application/vnd.ms-excel',
    xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
    xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xlt: 'application/vnd.ms-excel',
    xltm: 'application/vnd.ms-excel.template.macroenabled.12',
    xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    xlw: 'application/vnd.ms-excel',
    txt: 'text/plain',
    text: 'text/plain',
    conf: 'text/plain',
    log: 'text/plain',
    pdf: 'application/pdf',
    trk: 'CD-image/ddp',
  };
}
