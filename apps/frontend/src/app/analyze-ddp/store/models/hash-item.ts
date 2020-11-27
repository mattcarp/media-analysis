export interface HashItem {
  targetFileName: string;
  hash: string;
  lastModified?: Date;
  progress?: number;
  computedHash?: string;
}
