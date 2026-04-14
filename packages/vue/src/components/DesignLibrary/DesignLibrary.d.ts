import type { DefineComponent } from 'vue';

/**
 * Design Library component.
 *
 * Renders the real Sitecore component for `library` / `library-metadata` modes and,
 * when generation is enabled (`page.mode.designLibrary.isVariantGeneration === true`),
 * wires the variant generation handshake so the parent (DL Studio) can send
 * generated code to preview and iterate on.
 *
 * Must be used within a `SitecoreProvider`.
 * @example
 * ```vue
 * <template>
 *   <SitecoreProvider :page="page" :componentMap="componentMap" :loadImportMap="loadImportMap">
 *     <DesignLibrary />
 *   </SitecoreProvider>
 * </template>
 * ```
 * @public
 */
declare const DesignLibrary: DefineComponent<{}>;

export default DesignLibrary;
