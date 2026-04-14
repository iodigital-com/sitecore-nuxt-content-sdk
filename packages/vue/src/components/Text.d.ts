import type { DefineComponent, Component } from 'vue';
import type { FieldMetadata } from '@sitecore-content-sdk/content/layout';

/**
 * The Text field interface.
 * @public
 */
export interface TextField extends FieldMetadata {
  value?: string | number;
}

/**
 * Props for the Text component.
 * @public
 */
export interface TextProps {
  /** The text field data. */
  field?: TextField;
  /** The HTML element that wraps the field value. Defaults to span. */
  tag?: string;
  /** Whether the field is editable. Defaults to true. */
  editable?: boolean;
  /** If false, HTML-encoding is disabled. */
  encode?: boolean;
  /** Custom empty field editing component. */
  emptyFieldEditingComponent?: Component;
}

/**
 * Renders a Sitecore text field value.
 *
 * Supports encoding, line break formatting, custom tags, and editing mode metadata.
 * When the field is empty in editing mode, renders a default or custom empty field component.
 * @public
 */
declare const Text: DefineComponent<TextProps>;

export default Text;
