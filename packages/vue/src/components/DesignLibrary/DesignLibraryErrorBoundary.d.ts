import type { DefineComponent } from 'vue';

/**
 * Props for the DesignLibraryErrorBoundary component.
 * @internal
 */
export interface DesignLibraryErrorBoundaryProps {
  /** The unique identifier of the component being rendered. */
  uid: string;
  /** An optional key to reset the error state when changed. */
  renderKey?: number;
}

/**
 * Error boundary for the Design Library component.
 * Catches errors during rendering and sends them to the Design Library.
 * Resets the error state when `renderKey` changes.
 * @internal
 */
declare const DesignLibraryErrorBoundary: DefineComponent<DesignLibraryErrorBoundaryProps>;

export default DesignLibraryErrorBoundary;
