import type { DefineComponent } from 'vue';
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
declare const FEaaSWrapper: DefineComponent<FEaaSComponentProps>;

export default FEaaSWrapper;
