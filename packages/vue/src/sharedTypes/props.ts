import type { Component } from 'vue';

/**
 * Shared editing field props
 */
export interface EditableFieldProps<EmptyFieldEditingComponentProps = unknown> {
  /**
   * Can be used to explicitly disable inline editing.
   * @default true
   */
  editable?: boolean;
  /**
   * Custom component to render in Pages in edit mode if field value is empty
   */
  emptyFieldEditingComponent?: Component<EmptyFieldEditingComponentProps>;
}
