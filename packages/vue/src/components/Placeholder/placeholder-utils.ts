import {
  ComponentRendering,
  RouteData,
  isDynamicPlaceholder,
  getDynamicPlaceholderPattern,
} from '@sitecore-content-sdk/content/layout';
import { h, VNode } from 'vue';
import { HIDDEN_RENDERING_NAME } from '@sitecore-content-sdk/content';
import {
  ComponentMap,
  VueContentSdkComponent,
  VueModule,
  DEFAULT_EXPORT_NAME,
} from '../../sharedTypes';
import { ChildComponentProps, ComponentForRendering, PlaceholderProps } from './models';
import MissingComponent from '../MissingComponent.vue';
import HiddenRendering from '../HiddenRendering.vue';

/**
 * Get the renderings for the specified placeholder from the rendering layout data.
 * @param {ComponentRendering | RouteData} rendering rendering data
 * @param {string} name placeholder name
 * @param {boolean} isEditing whether components should be rendered in editing mode
 * @returns {ComponentRendering[]} array of component renderings
 */
export const getPlaceholderRenderings = (
  rendering: ComponentRendering | RouteData,
  name: string,
  isEditing: boolean
) => {
  let result;
  let phName = name.slice();

  if (rendering?.placeholders) {
    Object.entries(rendering.placeholders).forEach(([key, value]) => {
      const patternPlaceholder = isDynamicPlaceholder(key)
        ? getDynamicPlaceholderPattern(key)
        : null;

      if (patternPlaceholder && patternPlaceholder.test(phName)) {
        if (isEditing) {
          phName = key;
        } else {
          rendering.placeholders![phName] = value;
          delete rendering.placeholders![key];
        }
      }
    });
  }

  if (rendering && rendering.placeholders && Object.keys(rendering.placeholders).length > 0) {
    result = rendering.placeholders[phName];
  } else {
    result = null;
  }

  if (!result) {
    console.warn(
      `Placeholder '${phName}' was not found in the current rendering data`,
      JSON.stringify(rendering, null, 2)
    );

    return [];
  }

  return result;
};

/**
 * Get SXA specific params from Sitecore rendering params.
 * @param {ComponentRendering} rendering rendering object
 * @returns {object} converted SXA params
 */
export const getSXAParams = (rendering: ComponentRendering) => {
  if (!rendering.params) return { styles: '' };

  const { GridParameters, Styles } = rendering.params;

  return (
    (GridParameters || Styles) && {
      styles: `${GridParameters || ''} ${Styles || ''}`,
    }
  );
};

/**
 * Renders an empty placeholder wrapped in a div with the required CSS class for Page Builder edit mode.
 * @param {VNode | VNode[]} node vue node(s)
 * @returns {VNode} wrapped node
 * @public
 */
export const renderEmptyPlaceholder = (node: VNode | VNode[]): VNode => {
  return h('div', { class: 'sc-jss-empty-placeholder' }, Array.isArray(node) ? node : [node]);
};

/**
 * Merge specific placeholder props with component field and params content props.
 * @param {PlaceholderProps} placeholderProps placeholder props
 * @param {ComponentRendering} componentRendering component rendering
 * @returns {ChildComponentProps} merged props
 */
export function getChildComponentProps<T extends PlaceholderProps>(
  placeholderProps: T,
  componentRendering: ComponentRendering
): ChildComponentProps {
  const renderingFields =
    componentRendering.fields ||
    (!componentRendering.dataSource
      ? (placeholderProps.rendering as RouteData)?.fields
      : undefined);

  const fields = { ...(placeholderProps.fields || {}), ...(renderingFields || {}) };
  const params = { ...(placeholderProps.params || {}), ...(componentRendering.params || {}) };
  return {
    fields,
    params: {
      ...params,
      ...getSXAParams(componentRendering),
    },
    rendering: componentRendering,
  };
}

/**
 * Get component implementation from the component map based on the rendering definition.
 * @param {ComponentRendering} renderingDefinition rendering data
 * @param {string} placeholderName name of current placeholder
 * @param {ComponentMap} [componentMap] component map for the current app
 * @param {Component} [hiddenRenderingComponent] fallback component when the rendering is hidden
 * @param {Component} [missingComponentComponent] fallback component when no component is found in the component map
 * @returns {ComponentForRendering} component implementation
 */
export const getComponentForRendering = (
  renderingDefinition: ComponentRendering,
  placeholderName: string,
  componentMap?: ComponentMap,
  hiddenRenderingComponent?: VueContentSdkComponent,
  missingComponentComponent?: VueContentSdkComponent
): ComponentForRendering => {
  const logUnknownComponentError = (variant?: string) => {
    console.error(
      `Placeholder ${placeholderName} contains unknown component ${
        renderingDefinition.componentName
      }${
        variant ? ` (${variant})` : ''
      }. Ensure that a Vue component exists for it, and that it is registered in your component-map file.`
    );
  };

  if (renderingDefinition.componentName === HIDDEN_RENDERING_NAME) {
    return {
      component: hiddenRenderingComponent ?? HiddenRendering,
      isEmpty: true,
      componentType: 'universal',
    };
  } else if (!renderingDefinition.componentName) {
    return {
      component: { render: () => h('template') },
      isEmpty: true,
      componentType: 'universal',
    };
  }

  let component = null;
  if (!componentMap || componentMap.size === 0) {
    console.warn(
      `No components were available in component map to service request for component ${renderingDefinition}`
    );
  } else {
    component = componentMap.get(renderingDefinition.componentName);
  }

  if (!component) {
    logUnknownComponentError();
    return {
      component: missingComponentComponent ?? MissingComponent,
      isEmpty: true,
      componentType: 'universal',
    };
  }

  const exportName = renderingDefinition.params?.FieldNames;

  const renderedComponent =
    exportName && exportName !== DEFAULT_EXPORT_NAME
      ? ((component as VueModule)[exportName] as VueContentSdkComponent)
      : (component as VueModule).default ||
        (component as VueModule).Default ||
        (component as VueContentSdkComponent);

  if (!renderedComponent) {
    logUnknownComponentError(exportName !== DEFAULT_EXPORT_NAME ? exportName : undefined);

    return {
      component: missingComponentComponent ?? MissingComponent,
      isEmpty: true,
      componentType: 'universal',
    };
  }

  return {
    component: renderedComponent,
    componentType: (component as VueModule).componentType as ComponentForRendering['componentType'],
    isEmpty: false,
  };
};
