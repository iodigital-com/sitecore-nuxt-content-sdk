import type { DefineComponent } from 'vue';
export type { AppPlaceholderProps } from './models';

/**
 * Renders components from the layout data for the given placeholder name,
 * with consideration for page edit mode.
 * @public
 */
declare const AppPlaceholder: DefineComponent<AppPlaceholderProps>;

export default AppPlaceholder;
