import { EntryState } from './entry-state';
import { PqEntry } from './pq-entry';

export interface PqState extends EntryState {
  entries: PqEntry[];
}
