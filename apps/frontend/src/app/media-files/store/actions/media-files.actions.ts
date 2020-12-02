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

export const setSuccessAnalysisIds = createAction(
  '[Media File] Set Success Analysis IDs',
  props<{ successAnalysisIds: string[] }>(),
);

export const setErrorAnalysisIds = createAction(
  '[Media File] Set Error Analysis IDs',
  props<{ errorAnalysisIds: string[] }>(),
);
