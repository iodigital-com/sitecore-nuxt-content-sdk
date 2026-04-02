// Components - resolves to .d.ts files
export { default as SitecoreProvider } from './components/SitecoreProvider';
export { default as File } from './components/File';

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
