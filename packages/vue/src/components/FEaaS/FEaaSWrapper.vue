<script setup lang="ts">
import { computed } from 'vue';
import * as FEAAS from '@sitecore-feaas/clientside';
import { getDataFromFields } from '../../utils';
import { fetchFEaaSComponentServerProps } from './feaas-utils';
import { useSitecoreContext } from '../../composables/useSitecoreContext';
import type { FEaaSComponentProps } from './models';

/**
 * Renders a FEaaS component by fetching its template from the FEaaS CDN server-side
 * and hydrating it client-side via the `<feaas-component>` web component.
 *
 * In normal mode, the published revision is used. In preview/editing mode, the staged
 * revision is used instead.
 * @public
 * @example
 * ```vue
 * <FEaaSWrapper :rendering="rendering" :params="params" :fields="fields" :page="page" />
 * ```
 */
defineOptions({ name: 'FEaaSWrapper' });

const props = defineProps<FEaaSComponentProps>();

const context = useSitecoreContext();
const isPageStateNormal = computed(() => context.page.value.mode.isNormal);

const serverProps = await fetchFEaaSComponentServerProps(
  props.params ?? {},
  isPageStateNormal.value
);

const template = computed(() => serverProps?.template ?? props.template ?? '');
const revisionFallback = computed(() => serverProps?.revisionFallback ?? props.revisionFallback);
const fetchedData = computed(() => ({
  ...serverProps?.fetchedData,
  ...props.fetchedData,
  _: getDataFromFields(props.fields ?? {}),
}));

const computedRevision = computed(() => props.params?.ComponentRevision || revisionFallback.value);

const isValid = computed(() => {
  if (props.template || serverProps?.template) return true;
  return !!(
    props.params?.LibraryId &&
    props.params?.ComponentId &&
    props.params?.ComponentVersion &&
    props.params?.ComponentHostName &&
    computedRevision.value
  );
});

const styles = computed(() => `component feaas ${props.params?.styles ?? ''}`.trimEnd());
const id = computed(() => props.params?.RenderingIdentifier || undefined);
</script>

<template>
  <div :class="styles" :id="id">
    <div class="component-content">
      <feaas-component
        v-if="isValid"
        :data="JSON.stringify(fetchedData)"
        :template="template"
        :cdn="params?.ComponentHostName"
        :library="params?.LibraryId ?? ''"
        :version="params?.ComponentVersion"
        :component="params?.ComponentId ?? ''"
        :instance="params?.ComponentInstanceId"
        :revision="computedRevision || undefined"
      />
    </div>
  </div>
</template>
