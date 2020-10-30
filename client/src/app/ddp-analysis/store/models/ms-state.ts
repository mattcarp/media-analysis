import { EntryState } from './entry-state';
import { MsEntry } from './ms-entry';

export interface MsState extends EntryState {
  entries: MsEntry[];
}
