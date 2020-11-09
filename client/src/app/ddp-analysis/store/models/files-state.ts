import { DdpFile } from './ddp-file';

export interface FilesState {
  selectedAt: Date;
  path?: string;
  files: DdpFile[];
}
