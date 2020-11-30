export interface FileEntry {
  id?: string;
  analysed?: string;
  lastModified?: number;
  lastModifiedDate?: string;
  name?: string;
  preview?: string;
  size?: number;
  status?: string;
  type?: string;
}

export interface FileState {
  files: FileEntry[];
}
