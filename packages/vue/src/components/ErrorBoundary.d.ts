import type { Component } from 'vue';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';

/**
 * Props for the ErrorComponent.
 * Pass either `message` or use the default slot, not both.
 * @internal
 */
export type ErrorComponentProps = {
  message?: string;
};

/**
 * Props for the ErrorBoundary component.
 * `page` is injected automatically via `useSitecore()`.
 * @public
 */
export type ErrorBoundaryProps = {
  /** Whether the child component is already dynamically loaded. Skips Suspense when true. */
  isDynamic?: boolean;
  /** Custom component to render when an error is caught. Receives the error as a prop. */
  errorComponent?: Component;
  /** The rendering definition of the component being wrapped, used in error messages. */
  rendering?: ComponentRendering;
  /** Message shown in the Suspense fallback while the component loads. */
  componentLoadingMessage?: string;
  /**
   * Disables Suspense wrapping. Defaults to true.
   * Set to false to wrap children in a Suspense boundary.
   */
  disableSuspense?: boolean;
};
