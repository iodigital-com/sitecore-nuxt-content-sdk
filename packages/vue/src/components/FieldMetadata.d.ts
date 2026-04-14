import type { DefineComponent } from 'vue';

/**
 * Props for the FieldMetadata component.
 * @public
 */
export interface FieldMetadataProps {
  /** The field metadata object to serialize and render. */
  metadata: { [key: string]: unknown };
}

/**
 * Renders field metadata markup for chromes hydration in Sitecore Page Builder.
 * Wraps children between open and close code tags containing the field metadata.
 * @public
 */
declare const FieldMetadata: DefineComponent<FieldMetadataProps>;

export default FieldMetadata;
