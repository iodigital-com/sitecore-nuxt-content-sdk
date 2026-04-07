import { ref, computed, watch, onUnmounted, shallowRef, MaybeRefOrGetter, toValue } from 'vue';
import { SearchDocument, SearchParameters } from '@sitecore-content-sdk/search';
import { DEFAULT_PAGE_SIZE, getOffset, SearchStatus, useSearchService } from './utils';

/**
 * Options for the useSearch composable.
 * @public
 */
export interface UseSearchOptions<T extends SearchDocument = SearchDocument> {
  /**
   * The query string to search for.
   * By default empty string is used.
   */
  query?: MaybeRefOrGetter<string | undefined>;
  /**
   * The current page number (1-indexed).
   * If not provided, the search will start on page 1.
   */
  page?: MaybeRefOrGetter<number>;
  /**
   * The ID of the search index to use.
   */
  searchIndexId: MaybeRefOrGetter<string>;
  /**
   * Number of results per page.
   * @default 10
   */
  pageSize?: MaybeRefOrGetter<number>;
  /**
   * Specifies the sorting of the search results.
   */
  sort?: MaybeRefOrGetter<SearchParameters<T>['sort']>;
  /**
   * Specifies whether the search should automatically run.
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean>;
  /**
   * Specifies whether the previous search results should be kept when fetching new results.
   * @default false
   */
  keepPreviousData?: MaybeRefOrGetter<boolean>;
}

/**
 * The state of the useSearch composable.
 * @public
 */
export interface UseSearchState<T extends SearchDocument = SearchDocument> {
  /** The search results. */
  results: T[];
  /** Total number of results across all pages. */
  total: number;
  /** Total number of pages available based on `total` and `pageSize`. */
  totalPages: number;
  /** The error object if the last search request failed, or null if no error occurred. */
  error: Error | null;
  /**
   * The status of the search.
   * - 'idle' if no search request has been made yet.
   * - 'loading' if a search request is currently in progress.
   * - 'success' if a search request was successful.
   * - 'error' if a search request failed.
   * @default 'idle'
   */
  status: SearchStatus;
  /** Whether a search request is currently in progress. */
  isLoading: boolean;
  /** Whether the search request was successful. */
  isSuccess: boolean;
  /** Whether the search request failed. */
  isError: boolean;
  /**
   * Whether the search results from the previous query are returned.
   * Will be `true` if `keepPreviousData` is set.
   */
  isPreviousData: boolean;
}

/**
 * Vue composable for performing search queries with pagination.
 * @param {UseSearchOptions} options - Configuration options for the search composable.
 * @returns {UseSearchState} The search state as reactive computed properties.
 * @throws {Error} if the search index ID is not provided.
 * @public
 * @example
 * // Basic usage in a component
 * const { results, total, isLoading, isError, error } = useSearch({
 *   searchIndexId: 'my-index',
 *   query: 'sitecore',
 * });
 * @example
 * // With reactive query and pagination
 * const query = ref('');
 * const page = ref(1);
 *
 * const { results, total, totalPages, status } = useSearch({
 *   searchIndexId: 'my-index',
 *   query,
 *   page,
 *   pageSize: 20,
 * });
 */
export function useSearch<T extends SearchDocument = SearchDocument>(options: UseSearchOptions<T>) {
  const results = shallowRef<T[]>([]);
  const total = ref(0);
  const totalPages = ref(0);

  const resolvedSearchIndexId = toValue(options.searchIndexId);

  const error = ref<Error | null>(
    !resolvedSearchIndexId
      ? new Error('useSearch: searchIndexId is required when initializing the hook')
      : null
  );
  const status = ref<SearchStatus>(!resolvedSearchIndexId ? 'error' : 'idle');
  const previousStatus = ref<SearchStatus>('idle');

  const searchService = useSearchService().value;
  let abortController: AbortController | null = null;

  const search = async () => {
    const searchIndexId = toValue(options.searchIndexId);
    const query = toValue(options.query);
    const page = toValue(options.page) ?? 1;
    const pageSize = toValue(options.pageSize) ?? DEFAULT_PAGE_SIZE;
    const sort = toValue(options.sort);
    const keepPreviousData = toValue(options.keepPreviousData) ?? false;

    if (!searchService || !searchIndexId) {
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    previousStatus.value = status.value;
    status.value = 'loading';
    error.value = null;

    if (!keepPreviousData) {
      results.value = [];
      total.value = 0;
      totalPages.value = 0;
    }

    try {
      const offset = getOffset(page, pageSize);

      const searchParams: SearchParameters<T> = {
        searchIndexId,
        keyphrase: query,
        limit: pageSize,
        offset,
        sort,
      };

      const { results: searchResults, total: searchTotal } = await searchService.search<T>(
        searchParams,
        { signal }
      );

      if (signal.aborted) {
        return;
      }

      results.value = searchResults;
      total.value = searchTotal;
      totalPages.value = Math.ceil(searchTotal / pageSize);
      status.value = 'success';
      previousStatus.value = 'success';
      error.value = null;
    } catch (err) {
      if (signal.aborted) {
        return;
      }

      results.value = [];
      total.value = 0;
      totalPages.value = 0;
      status.value = 'error';
      previousStatus.value = 'error';
      error.value = err instanceof Error ? err : new Error(JSON.stringify(err));
    }
  };

  watch(
    () =>
      [
        toValue(options.query),
        toValue(options.page),
        toValue(options.pageSize),
        toValue(options.sort),
        toValue(options.enabled),
      ] as const,
    ([, , , , enabled]) => {
      if (enabled ?? true) {
        search();
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    abortController?.abort();
  });

  return {
    results: computed(() => results.value),
    total: computed(() => total.value),
    totalPages: computed(() => totalPages.value),
    error: computed(() => error.value),
    status: computed(() => status.value),
    isLoading: computed(() => status.value === 'loading'),
    isSuccess: computed(() => status.value === 'success'),
    isError: computed(() => status.value === 'error'),
    isPreviousData: computed(
      () =>
        (toValue(options.keepPreviousData) ?? false) &&
        previousStatus.value === 'success' &&
        status.value === 'loading'
    ),
  };
}
