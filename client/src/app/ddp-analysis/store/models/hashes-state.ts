import { HashItem } from './hash-item';

export interface HashesState {
  startedAt?: Date;
  completedAt?: Date;
  hashes: HashItem[];
}
