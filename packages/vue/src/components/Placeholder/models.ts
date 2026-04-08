import { Component, VNode } from 'vue';
import { Page } from '@sitecore-content-sdk/content/client';
import { ComponentRendering, Field, Item, RouteData } from '@sitecore-content-sdk/content/layout';
import { ComponentType } from '@sitecore-content-sdk/content/tools';
import { ComponentMap } from '../../sharedTypes';

// Re-export ComponentType to maintain API compatibility
export type { ComponentType };

type ErrorComponentProps = {
  [prop: string]: unknown;
};

/**
 * Base Placeholder props
 * @public
 */
export interface PlaceholderProps {
  /** Name of the placeholder to render. */
  name: string;
  /** Rendering data to be used when rendering the placeholder. */
  rendering: ComponentRendering | RouteData;
  /**
   * An object of field names/values that are aggregated and propagated through the component tree created by a placeholder.
   * Any component or placeholder rendered by a placeholder will have access to this data via `props.fields`.
   */
  fields?: {
    [name: string]: Field | Item | Item[];
  };
  /**
   * An object of rendering parameter names/values that are aggregated and propagated through the component tree created by a placeholder.
   * Any component or placeholder rendered by a placeholder will have access to this data via `props.params`.
   */
  params?: {
    [name: string]: string;
  };
  /**
   * A component that is rendered in place of any components that are in this placeholder,
   * but do not have a definition in the componentMap (i.e. don't have a Vue implementation).
   */
  missingComponentComponent?: Component;
  /**
   * A component that is rendered in place of any components that are hidden.
   */
  hiddenRenderingComponent?: Component;
  /**
   * A component that is rendered in place of the placeholder when an error occurs rendering
   * the placeholder.
   */
  errorComponent?: Component<ErrorComponentProps>;
  /**
   * Page data.
   * This data is passed by the SitecoreProvider.
   */
  page?: Page;
  /**
   * Render function that is called when the placeholder contains no content components.
   */
  renderEmpty?: (components: VNode[]) => VNode[];
  /**
   * Render function that is called for each non-system component added to the placeholder.
   * Mutually exclusive with `render`.
   */
  renderEach?: (component: VNode, index: number) => VNode;
  /**
   * Render function that enables control over the rendering of the components in the placeholder.
   * Useful for techniques like wrapping each child in a wrapper component.
   */
  render?: (components: VNode[], data: ComponentRendering[], props: PlaceholderProps) => VNode[];
  /**
   * Modify final props of component (before render) provided by rendering data.
   * Can be used in case when you need to insert additional data into the component.
   * @param {ChildComponentProps} componentProps component props to be modified
   * @returns {ChildComponentProps} modified or initial props
   */
  modifyComponentProps?: (componentProps: ChildComponentProps) => ChildComponentProps;
  /**
   * An alternative to `modifyComponentProps` that allows passing additional props to the component
   * without modifying the CSDK Placeholder props from Sitecore.
   * These props will be merged into the result of modifyComponentProps if you use both.
   */
  passThroughComponentProps?: {
    [key: string]: unknown;
  };
  /**
   * Component Map will be used to map Sitecore component names to app implementation.
   * When rendered within a SitecoreProvider component, defaults to the context componentMap.
   */
  componentMap?: ComponentMap;
}

/**
 * The interface for the AppPlaceholder server-side component props.
 * @public
 */
export type AppPlaceholderProps = Omit<PlaceholderProps, 'componentMap' | 'page'> &
  Required<Pick<PlaceholderProps, 'componentMap' | 'page'>>;

export type RenderedProps = ChildComponentProps & {
  key: string;
};

export interface ChildComponentProps {
  fields: {
    [name: string]: Field | Item | Item[];
  };
  params: {
    [name: string]: string;
  };
  rendering: ComponentRendering;
}

export interface ComponentForRendering {
  component: Component;
  isEmpty: boolean;
  dynamic?: boolean;
  componentType?: ComponentType;
}

/**
 * Prop names from placeholder that cannot be serialized and passed between server and client components.
 */
export const nonSerializedPlaceholderProps = [
  'renderEmpty',
  'render',
  'renderEach',
  'errorComponent',
  'modifyComponentProps',
  'componentMap',
  'page',
  'missingComponentComponent',
  'hiddenRenderingComponent',
] as const satisfies (keyof PlaceholderProps)[];

/**
 * Props containing the component data to render.
 * @internal
 */
export interface PlaceholderMetadataProps {
  /** The rendering data. */
  rendering: ComponentRendering;
  /** The name of the placeholder. */
  placeholderName?: string;
  /**
   * Component runtime type. Used to add `data-csdk-component-runtime` attribute to rendering chromes.
   */
  componentRuntime?: 'server' | 'client';
}

/**
 * Attributes applied to the `<code>` chrome blocks rendered around components and placeholders.
 * @internal
 */
export type CodeBlockAttributes = {
  type: string;
  chrometype: string;
  class: string;
  kind: string;
  id?: string;
  'data-csdk-component-runtime'?: 'server' | 'client';
};
