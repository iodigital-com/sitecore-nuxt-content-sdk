import type { DefineComponent } from 'vue';

/**
 * Represents the value of a File field from Sitecore.
 * @public
 */
export interface FileFieldValue {
  [propName: string]: unknown;
  src?: string;
  title?: string;
  displayName?: string;
}

/**
 * Represents a File field from Sitecore.
 * @public
 */
export interface FileField {
  value: FileFieldValue;
}

/**
 * Renders a Sitecore File field as an anchor tag.
 * Falls back to `title` or `displayName` as link text when no slot content is provided.
 * Renders nothing when the field value is empty.
 * @example
 * ```vue
 * <File :field="fields.file" />
 * ```
 * @example
 * // With custom link text via slot
 * ```vue
 * <File :field="fields.file">Download PDF</File>
 * ```
 * @public
 */
declare const File: DefineComponent<{
  /** The file field data. */
  field: FileFieldValue | FileField;
}>;

export default File;
