import type { DefineComponent } from 'vue';
export type { PlaceholderProps } from './models';

/**
 * Renders the components assigned to a placeholder in Sitecore.
 * Reads the current page and componentMap from the SitecoreProvider context.
 * @example
 * ```vue
 * <Placeholder name="main" :rendering="route" />
 * ```
 * @public
 */
declare const Placeholder: DefineComponent<PlaceholderProps>;

export default Placeholder;
