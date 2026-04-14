import type { DefineComponent } from 'vue';

/**
 * Default empty field editing component for image fields.
 * Renders a placeholder image when an image field is empty in editing mode.
 * @public
 */
declare const DefaultEmptyFieldEditingComponentImage: DefineComponent<{
  [key: string]: unknown;
  class?: string;
}>;

export default DefaultEmptyFieldEditingComponentImage;
