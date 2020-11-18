import { ValidationEntry } from './validation-entry';

interface FileItem {
  name?: string;
  reqSize?: number;
  actualSize?: number;
  diff?: number;
}

export interface ValidationState {
  created: Date;
  failCount?: number;
  blockCount?: number;
  warnCount?: number;
  entries: ValidationEntry[];
  totalPasses?: number;
  totalFails?: number;
  missingFiles?: FileItem[];
  pqMsIssues?: FileItem[];
  sizeMatches?: FileItem[];
  sizeMismatches?: FileItem[];
  foundFiles?: FileItem[];
}
