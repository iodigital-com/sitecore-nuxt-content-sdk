import type { DefineComponent } from 'vue';

/**
 * Default empty field editing component for text fields.
 * Renders a placeholder text when a text field is empty in editing mode.
 * @public
 */
declare const DefaultEmptyFieldEditingComponentText: DefineComponent<{
  [key: string]: unknown;
  tag?: string;
}>;

export default DefaultEmptyFieldEditingComponentText;
