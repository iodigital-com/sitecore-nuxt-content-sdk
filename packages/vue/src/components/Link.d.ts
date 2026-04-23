import type { Component } from 'vue';
import type { FieldMetadata } from '@sitecore-content-sdk/content/layout';

/**
 * The interface for the Link field value.
 * @public
 */
export interface LinkFieldValue {
  [attributeName: string]: unknown;
  href?: string;
  class?: string;
  title?: string;
  target?: string;
  text?: string;
  anchor?: string;
  querystring?: string;
  linktype?: string;
}

/**
 * The interface for the Link field.
 * @public
 */
export interface LinkField {
  value: LinkFieldValue;
}

/**
 * The interface for the Link component props.
 *
 * HTML attributes such as `id`, `style`, and `class` can be passed directly
 * and will be applied to the rendered `<a>` element.
 * Use `class` — not `className` (this is not React).
 * @public
 */
export interface LinkProps {
  [attributeName: string]: unknown;
  /** The link field data. */
  field?: (LinkField | LinkFieldValue) & FieldMetadata;
  /**
   * Displays the link text even when slot content is present.
   */
  showLinkTextWithChildrenPresent?: boolean;
  /** Whether the field is editable in Page Builder. Defaults to true. */
  editable?: boolean;
  /** Custom component to render when the field is empty in editing mode. */
  emptyFieldEditingComponent?: Component;
}
