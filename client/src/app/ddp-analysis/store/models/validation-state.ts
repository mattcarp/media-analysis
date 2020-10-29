import { ValidationEntry } from './validation-entry';

export interface ValidationState {
  created: Date;
  failCount?: number;
  blockCount?: number;
  warnCount?: number;
  entries: ValidationEntry[];
}
