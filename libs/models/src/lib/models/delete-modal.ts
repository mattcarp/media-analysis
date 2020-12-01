export interface DeleteModal {
  showDeleteModal?: boolean;
  title?: string;
  bodyText?: string;
  parameters: {
    allowToRemove?: boolean;
    isRemoveAll?: boolean;
    fileId?: string;
  };
}
