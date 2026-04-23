import type { Component } from 'vue';
import type { FieldMetadata } from '@sitecore-content-sdk/content/layout';

/**
 * The props for the DateField component.
 * @public
 */
export interface DateFieldProps {
  [htmlAttributes: string]: unknown;
  /** The date field data. */
  field?: FieldMetadata & {
    value?: string;
  };
  /**
   * The HTML element that will wrap the contents of the field.
   * When omitted, the date is rendered as a text node without a wrapper element.
   */
  tag?: string;
  /**
   * Custom render function for the date value.
   * Receives a `Date` object, or `null` if the field value is empty.
   * @example
   * :render="(date) => date?.toLocaleDateString('nl-NL')"
   */
  render?: (date: Date | null) => string;
  /** Whether the field is editable in Page Builder. Defaults to true. */
  editable?: boolean;
  /** Custom component to render when the field is empty in editing mode. */
  emptyFieldEditingComponent?: Component;
}
