import type * as FEAAS from '@sitecore-feaas/clientside';
import type { Component } from 'vue';
import type { ComponentFields, ComponentRendering } from '@sitecore-content-sdk/content/layout';
import type { Page } from '@sitecore-content-sdk/content/client';

export const FEAAS_WRAPPER_RENDERING_NAME = 'FEaaSWrapper';
export const FEAAS_COMPONENT_RENDERING_NAME = 'FEaaSComponent';
export const BYOC_WRAPPER_RENDERING_NAME = 'BYOCWrapper';
export const BYOC_COMPONENT_RENDERING_NAME = 'BYOCComponent';

/**
 * Error component props.
 * @public
 */
export type ErrorComponentProps = {
  [prop: string]: unknown;
  error?: Error;
};

// ─── BYOC ────────────────────────────────────────────────────────────────────

/**
 * FEaaS props for server rendering.
 * @public
 */
export type BYOCServerProps = {
  /**
   * Fetched data from server component props for server rendering, based on rendering params.
   */
  fetchedData?: FEAAS.DataScopes;
};

/**
 * Data from rendering params on Sitecore's BYOC rendering.
 * @public
 */
export type BYOCComponentParams = {
  /**
   * Name of the component to render.
   */
  ComponentName?: string;
  /**
   * JSON props to pass into the rendered component.
   */
  ComponentProps?: string;
  /**
   * A JSON object with data sources to be fetched and passed to the component.
   */
  ComponentDataOverride?: string;
  /**
   * CSS classes for SXA theming support.
   */
  styles?: string;
  RenderingIdentifier?: string;
};

/**
 * Props for the BYOC component.
 * @public
 */
export type BYOCComponentProps = BYOCServerProps & {
  /**
   * Rendering data.
   */
  rendering: ComponentRendering;
  /**
   * Rendering params.
   */
  params?: BYOCComponentParams;
  /**
   * Fields from datasource items to be passed as rendered child component props.
   */
  fields?: ComponentFields;
  /**
   * Error component override. Shown when the renderer or underlying component throws.
   */
  errorComponent?: Component<ErrorComponentProps>;
  /**
   * Override to indicate missing component situations. Shown when the BYOC component
   * is not registered or ComponentName is missing.
   */
  missingComponentComponent?: Component;
};

// ─── FEaaS ───────────────────────────────────────────────────────────────────

/**
 * Revision type for FEaaS component.
 * @public
 */
export type RevisionType = number | 'staged' | 'published' | 'saved';

/**
 * Params from a Sitecore FEaaS rendering.
 * @public
 */
export type FEaaSComponentParams = {
  LibraryId?: string;
  ComponentId?: string;
  ComponentVersion?: string;
  ComponentRevision?: RevisionType;
  ComponentHostName?: string;
  ComponentInstanceId?: string;
  ComponentDataOverride?: string;
  ComponentHTMLOverride?: string;
  styles?: string;
  RenderingIdentifier?: string;
};

/**
 * FEaaS props for server-side rendering.
 * @public
 */
export type FEaaSComponentServerProps = {
  /**
   * HTML template for presentation rendered inside the component.
   */
  template?: string;
  /**
   * Default revision to use. Should be 'staged' for editing/preview.
   * Can be overridden by params.ComponentRevision.
   */
  revisionFallback?: RevisionType;
  /**
   * Fetched data from server props.
   */
  fetchedData?: FEAAS.DataScopes;
};

/**
 * FEaaS props for client-side rendering.
 * Used as fallback when server props are not provided.
 * @public
 */
export type FEaaSComponentClientProps = {
  /**
   * Parameters from Sitecore's FEaaS rendering.
   */
  params?: FEaaSComponentParams;
  /**
   * Field data from the component's datasource.
   */
  fields?: ComponentFields;
};

/**
 * Combined FEaaS component props.
 * @public
 */
export type FEaaSComponentProps = FEaaSComponentServerProps &
  FEaaSComponentClientProps & {
    /**
     * Rendering data.
     */
    rendering?: ComponentRendering;
    /**
     * Current page data. Used to determine revision fallback (staged vs published).
     */
    page?: Page;
  };
