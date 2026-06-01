<script lang="ts">
import { form } from '@sitecore-content-sdk/content';

let { executeScriptElements, loadForm, subscribeToFormSubmitEvent } = form;

/**
 * Mock function to replace the form module functions for testing purposes.
 * @param {any} formModule - The form module to mock
 */
export const mockFormModule = (formModule: any) => {
  executeScriptElements = formModule.executeScriptElements;
  loadForm = formModule.loadForm;
  subscribeToFormSubmitEvent = formModule.subscribeToFormSubmitEvent;
};
</script>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { constants } from '@sitecore-content-sdk/core';
import { useSitecoreContext } from '../composables/useSitecoreContext';
import ErrorComponent from './ErrorComponent.vue';
import type { FormProps } from './Form';

/**
 * Renders a Sitecore Form by fetching its HTML from the Edge API and
 * injecting it into the DOM. Handles script execution and form submit
 * event subscription after the form HTML is rendered.
 *
 * In editing mode, shows an error message when the form fails to load.
 * In normal mode, errors are swallowed silently.
 * @public
 * @example
 * ```vue
 * <Form :rendering="rendering" :params="params" />
 * ```
 */
defineOptions({ name: 'Form' });

const { ERROR_MESSAGES } = constants;

const props = defineProps<FormProps>();

const content = ref('');
const error = ref(false);
const formRef = ref<HTMLDivElement | null>(null);

const context = useSitecoreContext();
const isEditing = computed(() => context.page.value.mode.isEditing);

// flush: 'post' ensures the DOM is updated with the form HTML before
// executeScriptElements and subscribeToFormSubmitEvent run
onMounted(async () => {
  const edgeId = context.api?.edge?.clientContextId;
  const edgeUrl = context.api?.edge?.edgeUrl;
  const formId = props.params.FormId;
  const uid = props.rendering.uid;
  const editing = isEditing.value;

  if (!edgeId) {
    console.warn(`${ERROR_MESSAGES.MV_006}. Form cannot be loaded properly on the client`);
    return;
  }

  try {
    const html = await loadForm(edgeId, formId, edgeUrl);
    content.value = html;

    await nextTick();

    if (!formRef.value) return;

    if (!editing) {
      subscribeToFormSubmitEvent(formRef.value, uid);
    }

    executeScriptElements(formRef.value);
  } catch {
    if (editing) {
      console.error(
        `Failed to load form with id ${formId}. Check debug logs for content-sdk:form for more details. ${ERROR_MESSAGES.CONTACT_SUPPORT}`
      );
    }
    error.value = true;
  }
});
</script>

<template>
  <ErrorComponent v-if="isEditing && error" message="There was a problem loading this section" />
  <div
    v-else
    :id="params.RenderingIdentifier || undefined"
    ref="formRef"
    :class="params.styles?.trimEnd() || undefined"
    v-html="content"
  />
</template>
