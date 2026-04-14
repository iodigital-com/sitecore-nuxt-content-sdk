import type { Component, DefineComponent } from 'vue';
import type { FieldMetadata } from '@sitecore-content-sdk/content/layout';

/**
 * The RichText field interface.
 * @public
 */
export interface RichTextField extends FieldMetadata {
  value?: string;
}

/**
 * The RichText component props.
 * @public
 */
export interface RichTextProps {
  /** The rich text field data. */
  field?: RichTextField;
  /** The HTML element that wraps the field value. Defaults to div. */
  tag?: string;
  /** Whether the field is editable. Defaults to true. */
  editable?: boolean;
  /** Custom empty field editing component. */
  emptyFieldEditingComponent?: Component;
}

/**
 * Renders a Sitecore rich text field.
 * @public
 */
declare const RichText: DefineComponent<RichTextProps>;

export default RichText;
