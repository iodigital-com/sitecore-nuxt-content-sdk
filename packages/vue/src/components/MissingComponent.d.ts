import type { DefineComponent } from 'vue';

export interface MissingComponentProps {
  rendering?: {
    componentName?: string;
  };
  errorOverride?: string;
}

/**
 * Renders a fallback component when a Sitecore component has no Vue implementation.
 * @public
 */
declare const MissingComponent: DefineComponent<MissingComponentProps>;

export default MissingComponent;
