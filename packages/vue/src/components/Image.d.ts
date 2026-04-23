import type { Component } from 'vue';
import type { FieldMetadata } from '@sitecore-content-sdk/content/layout';

/**
 * The interface for the Image field value.
 * @public
 */
export interface ImageFieldValue {
  [attributeName: string]: unknown;
  /** Source URL of the image */
  src?: string;
}

/**
 * The interface for the Image field.
 * @public
 */
export interface ImageField {
  value?: ImageFieldValue;
}

/**
 * The interface for the Image size parameters.
 * @public
 */
export interface ImageSizeParameters {
  [attr: string]: string | number | undefined;
  /** Fixed width of the image */
  w?: number;
  /** Fixed height of the image */
  h?: number;
  /** Max width of the image */
  mw?: number;
  /** Max height of the image */
  mh?: number;
  /** Ignore aspect ratio */
  iar?: 1 | 0;
  /** Allow stretch */
  as?: 1 | 0;
  /** Image scale. Defaults to 1.0 */
  sc?: number;
}

/**
 * The interface for the Image component props.
 *
 * HTML attributes (such as `class`, `alt`, `width`, `height`) can be passed directly
 * and will be applied to the rendered `<img>` element.
 * Use `class` — not `className` (this is not React).
 * @public
 */
export interface ImageProps {
  [attributeName: string]: unknown;
  /** Image field data */
  field?: (ImageField | ImageFieldValue) & FieldMetadata;
  /**
   * Parameters that will be attached to Sitecore media URLs.
   */
  imageParams?: { [paramName: string]: string | number };
  /** Srcset size parameters for responsive images */
  srcSet?: ImageSizeParameters[];
  /**
   * Custom regexp that finds media URL prefix that will be replaced by `/-/jssmedia` or `/~/jssmedia`.
   * @example
   * /\/([-~]{1})assets\//i
   * /-assets/website -> /-/jssmedia/website
   * /~assets/website -> /~/jssmedia/website
   */
  mediaUrlPrefix?: RegExp;
  /** Whether the field is editable in Page Builder. Defaults to true. */
  editable?: boolean;
  /**
   * CSS class(es) to apply to the rendered `<img>` element.
   * Use `class` — not `className` (this is not React).
   */
  class?: string;
  /** Custom component to render when the field is empty in editing mode */
  emptyFieldEditingComponent?: Component;
}
