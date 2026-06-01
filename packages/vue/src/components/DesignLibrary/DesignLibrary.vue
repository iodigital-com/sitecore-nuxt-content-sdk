<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import {
  EDITING_COMPONENT_ID,
  EDITING_COMPONENT_PLACEHOLDER,
} from '@sitecore-content-sdk/content/layout';
import {
  DesignLibraryStatus,
  getDesignLibraryStatusEvent,
  addComponentUpdateHandler,
} from '@sitecore-content-sdk/content/editing';
import * as codegen from '@sitecore-content-sdk/content/codegen';
import * as editing from '@sitecore-content-sdk/content/editing';
import { useSitecoreContext } from '../../composables/useSitecoreContext';
import Placeholder from '../Placeholder/Placeholder.vue';
import PlaceholderMetadata from '../Placeholder/PlaceholderMetadata.vue';
import DesignLibraryErrorBoundary from './DesignLibraryErrorBoundary.vue';
import type { DynamicComponent } from './models';

const props = defineProps<{
  /**
   * Optional callback invoked when a component update is received from Design Library.
   * Use this to trigger server-side cache invalidation (e.g. in Nuxt via useDesignLibraryActions).
   */
  onServerComponentUpdate?: (rendering: ComponentRendering) => Promise<void> | void;
}>();

/**
 * Design Library component.
 *
 * Renders the real Sitecore component for `library` / `library-metadata` modes and,
 * when generation is enabled (`page.mode.designLibrary.isVariantGeneration === true`),
 * wires the variant generation handshake so the parent (DL Studio) can send
 * generated code to preview and iterate on.
 * @public
 */
defineOptions({ name: 'DesignLibrary' });

let {
  getDesignLibraryImportMapEvent,
  getDesignLibraryComponentPropsEvent,
  addComponentPreviewHandler,
  sendErrorEvent,
} = codegen;
let { postToDesignLibrary } = editing;

const { page, loadImportMap } = useSitecoreContext();

const route = page.value.layout.sitecore.route;
const rendering = route?.placeholders[EDITING_COMPONENT_PLACEHOLDER]?.[0];
const uid = rendering?.uid;

const { isDesignLibrary } = page.value.mode;
const isVariantGeneration = page.value.mode.designLibrary?.isVariantGeneration;

const propsState = ref({
  fields: rendering?.fields,
  params: rendering?.params,
});
const renderKey = ref(0);
const DynamicComp = ref<DynamicComponent | null>(null);
const isGeneratedComponentActive = ref(false);

let unsubUpdate: (() => void) | undefined;
let unsubPreview: (() => void) | undefined;

onMounted(async () => {
  if (!uid) return;

  postToDesignLibrary(getDesignLibraryStatusEvent(DesignLibraryStatus.READY, uid));

  if (!isVariantGeneration) {
    requestAnimationFrame(() => {
      if (renderKey.value === 0) renderKey.value += 1;
    });
  }

  unsubUpdate = addComponentUpdateHandler(rendering, (updated) => {
    propsState.value = { fields: updated.fields, params: updated.params };
    renderKey.value += 1;
    props.onServerComponentUpdate?.(updated);
  });

  if (isDesignLibrary && isVariantGeneration) {
    if (!loadImportMap) {
      sendErrorEvent(
        uid,
        'No loadImportMap provided',
        codegen.DesignLibraryPreviewError.ImportMapMissing
      );
      return;
    }

    let importMap: codegen.ImportEntry[];
    try {
      const mod = await loadImportMap();
      importMap = mod.default;
    } catch (e) {
      sendErrorEvent(
        uid,
        `Error loading import map: ${e}`,
        codegen.DesignLibraryPreviewError.ImportMapLoad
      );
      return;
    }

    unsubPreview = addComponentPreviewHandler(importMap, (error, Component) => {
      if (error) return;
      DynamicComp.value = Component as DynamicComponent;
      isGeneratedComponentActive.value = true;
      renderKey.value += 1;
    });

    postToDesignLibrary(getDesignLibraryImportMapEvent(uid, importMap));
    postToDesignLibrary(
      getDesignLibraryComponentPropsEvent(uid, propsState.value.fields, propsState.value.params)
    );
  }
});

watch(renderKey, (newKey) => {
  if (newKey === 0 || !uid) return;
  postToDesignLibrary(getDesignLibraryStatusEvent(DesignLibraryStatus.RENDERED, uid));
});

onUnmounted(() => {
  unsubUpdate?.();
  unsubPreview?.();
});
</script>

<template>
  <template v-if="isDesignLibrary">
    <div v-if="!uid">Rendering UID is missing in the rendering data</div>
    <main v-else>
      <template v-if="isGeneratedComponentActive">
        <DesignLibraryErrorBoundary :uid="uid" :render-key="renderKey">
          <PlaceholderMetadata v-if="rendering" :rendering="rendering">
            <component
              :is="DynamicComp"
              :key="renderKey"
              :fields="propsState.fields"
              :params="propsState.params"
            />
          </PlaceholderMetadata>
        </DesignLibraryErrorBoundary>
      </template>
      <template v-else>
        <div :id="EDITING_COMPONENT_ID">
          <Placeholder
            v-if="route"
            :key="renderKey"
            :name="EDITING_COMPONENT_PLACEHOLDER"
            :rendering="route"
          />
        </div>
      </template>
    </main>
  </template>
</template>
