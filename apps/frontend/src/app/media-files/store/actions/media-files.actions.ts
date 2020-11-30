import { createAction, props } from '@ngrx/store';

import { ValidationState } from '../models';

export const setMediaFiles = createAction(
  '[Media File] Set Files',
  props<{ files: any[] }>(),
);

export const setValidationsState = createAction(
  '[Media File] Set Validations State',
  props<{ validations: ValidationState[] }>(),
);
