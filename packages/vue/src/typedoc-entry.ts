// Components - resolves to .d.ts files
export { default as SitecoreProvider } from './components/SitecoreProvider';
export { default as File } from './components/File';
export { default as Placeholder } from './components/Placeholder/Placeholder';
export { default as PlaceholderMetadata } from './components/Placeholder/PlaceholderMetadata';
export { default as AppPlaceholder } from './components/Placeholder/AppPlaceholder';
export { default as HiddenRendering } from './components/HiddenRendering';
export { default as MissingComponent } from './components/MissingComponent';

// Composables
export { useSitecoreContext } from './composables/useSitecoreContext';

// Types
export type { SitecoreProviderProps } from './components/SitecoreProvider';
export type { FileField, FileFieldValue } from './components/File';
export type {
  SitecoreProviderState,
  UseSitecoreContextOptions,
} from './composables/useSitecoreContext';

export * from './sharedTypes/components';
