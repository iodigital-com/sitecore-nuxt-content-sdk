<script setup lang="ts">
import { h, VNode } from 'vue';
import { AppPlaceholderProps, ChildComponentProps } from './models';
import {
  getChildComponentProps,
  getComponentForRendering,
  getPlaceholderRenderings,
  renderEmptyPlaceholder,
} from './placeholder-utils';
import { ComponentRendering } from '@sitecore-content-sdk/content/layout';
import PlaceholderMetadata from './PlaceholderMetadata.vue';

/**
 * Renders components from the layout data for the given placeholder name,
 * with consideration for page edit mode. Pulls components from the provided component map.
 *
 * In edit mode, wraps each component and the placeholder itself in `PlaceholderMetadata`
 * chrome blocks so Page Builder can identify and interact with them.
 *
 * @example
 * ```vue
 * <AppPlaceholder name="main" :rendering="route" :page="page" :component-map="componentMap" />
 * ```
 *
 * @public
 */
defineOptions({
  name: 'AppPlaceholder',
});

const props = defineProps<AppPlaceholderProps>();

const getPlaceholderComponents = (
  placeholderProps: AppPlaceholderProps,
  placeholderRenderings: ComponentRendering[]
): VNode[] => {
  const {
    name,
    rendering,
    passThroughComponentProps,
    missingComponentComponent,
    hiddenRenderingComponent,
    errorComponent,
    renderEach,
    modifyComponentProps,
    componentMap,
    page,
  } = placeholderProps;

  const isEditing = page.mode.isEditing;

  const transformedComponents = placeholderRenderings
    .map((componentRendering: ComponentRendering, index: number) => {
      const { component: ChildComponent, isEmpty: componentEmpty } = getComponentForRendering(
        componentRendering,
        name,
        componentMap,
        hiddenRenderingComponent,
        missingComponentComponent
      );

      const key = componentRendering.uid ?? `component-${index}`;

      const renderedProps: ChildComponentProps = modifyComponentProps
        ? modifyComponentProps(getChildComponentProps(placeholderProps, componentRendering))
        : getChildComponentProps(placeholderProps, componentRendering);

      let rendered = h(ChildComponent, {
        key,
        ...renderedProps,
        ...passThroughComponentProps,
        page,
        componentMap,
      });

      if (renderEach) {
        rendered = renderEach(rendered, index) as VNode;
      }

      if (!componentEmpty && errorComponent) {
        rendered = h(errorComponent, { key: `error-${index}` }, { default: () => rendered });
      }

      if (isEditing) {
        return h(
          PlaceholderMetadata,
          { key, rendering: componentRendering },
          { default: () => rendered }
        );
      }

      return rendered;
    })
    .filter(Boolean) as VNode[];

  if (!isEditing) {
    return transformedComponents;
  }

  return [
    h(
      PlaceholderMetadata,
      {
        key: (rendering as ComponentRendering).uid,
        placeholderName: name,
        rendering: rendering as ComponentRendering,
      },
      { default: () => transformedComponents }
    ),
  ];
};

const render = (): VNode | VNode[] => {
  const isEditing = props.page.mode.isEditing;
  const placeholderRenderings = getPlaceholderRenderings(props.rendering, props.name, isEditing);
  const isEmpty = !placeholderRenderings.length;

  const components = getPlaceholderComponents(props, placeholderRenderings);

  if (isEmpty) {
    let renderedOutput: VNode | VNode[] = components;

    if (props.renderEmpty) {
      renderedOutput = props.renderEmpty(components) as VNode[];
    }

    if (isEditing) return renderEmptyPlaceholder(renderedOutput);
    return Array.isArray(renderedOutput) ? renderedOutput : [renderedOutput];
  }

  if (props.render) {
    return props.render(components, placeholderRenderings, props) as VNode[];
  }

  return components;
};
</script>

<template>
  <component :is="render" />
</template>
