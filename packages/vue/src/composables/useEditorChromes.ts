import { onMounted, onUpdated } from 'vue';
import { resetEditorChromes } from '@sitecore-content-sdk/content/editing';

/**
 * Composable that resets Sitecore editor chromes on subsequent component updates.
 * Call this in the setup of any component that needs to notify the Page Builder
 * of DOM changes after the initial render.
 *
 * Skips the first render — only fires on re-renders, consistent with the
 * Next.js `withEditorChromes` HOC behaviour.
 * @public
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useEditorChromes } from '@sitecore-content-sdk/vue';
 *
 * useEditorChromes();
 * </script>
 * ```
 */
export function useEditorChromes(): void {
  let isFirstRender = true;

  onMounted(() => {
    isFirstRender = false;
  });

  onUpdated(() => {
    if (isFirstRender) return;
    resetEditorChromes();
  });
}
