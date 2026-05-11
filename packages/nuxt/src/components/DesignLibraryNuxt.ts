/* eslint-disable react-hooks/rules-of-hooks */
import { defineComponent, h } from 'vue';
import { DesignLibrary } from '@sitecore-content-sdk/vue';
import { useDesignLibraryActions } from '../composables/useDesignLibraryActions';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';

/**
 * Nuxt wrapper around DesignLibrary that wires server-side cache invalidation
 * via useDesignLibraryActions when a component update is received from Design Library.
 * @public
 */
const DesignLibraryNuxt = defineComponent({
  name: 'DesignLibraryNuxt',
  setup() {
    const { updateComponent } = useDesignLibraryActions();

    /**
     * Handler for component updates received from Design Library. Triggers server-side cache invalidation
     * by calling updateComponent with the updated rendering data.
     * @param { ComponentRendering } rendering The updated component rendering.
     */
    async function onServerComponentUpdate(rendering: ComponentRendering) {
      if (!rendering.uid) return;
      await updateComponent({ uid: rendering.uid, rendering });
    }

    return () => h(DesignLibrary, { onServerComponentUpdate });
  },
});

export default DesignLibraryNuxt;
