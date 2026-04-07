import { ref, computed, watch, onUnmounted, shallowRef, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { DEFAULT_PAGE_SIZE, SearchStatus, useSearchService } from './utils';
import { SearchDocument, SearchParameters } from '@sitecore-content-sdk/search';

/**
 * Options for the useInfiniteSearch composable.
 * @public
 */
export interface UseInfiniteSearchOptions<T extends SearchDocument = SearchDocument> {
  /**
   * The query string to search for.
   * By default empty string is used.
   */
  query?: MaybeRefOrGetter<string | undefined>;
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
}

/**
 * The state of the useInfiniteSearch composable.
 * @public
 */
export interface UseInfiniteSearchState<T extends SearchDocument = SearchDocument> {
  /** The search results. */
  results: T[];
  /** Total number of results across all pages. */
  total: number;
  /** Total number of pages available based on `total` and `pageSize`. */
  totalPages: number;
  /** The error object if the last search request failed, or null if no error occurred. */
  error: Error | null;
  /**
   * The status of the initial search request.
   * - 'idle' if no search request has been made yet.
   * - 'loading' if a search request is currently in progress.
   * - 'success' if a search request was successful.
   * - 'error' if a search request failed.
   * @default 'idle'
   */
  status: SearchStatus;
  /**
   * The status of the "load more" request.
   * - 'idle' if no "load more" request has been made yet.
   * - 'loading' if a "load more" request is currently in progress.
   * - 'error' if a "load more" request failed.
   * @default 'idle'
   */
  loadMoreStatus: Omit<SearchStatus, 'success'>;
  /** Load the next page of results. */
  loadMore: () => void;
  /** Whether there are more results available. */
  hasNextPage: boolean;
  /** Whether a search request is currently in progress. */
  isLoading: boolean;
  /** Whether the search request was successful. */
  isSuccess: boolean;
  /** Whether the search request failed. */
  isError: boolean;
  /** Whether a search request for more results is currently in progress. */
  isLoadingMore: boolean;
  /** Whether the search request for more results failed. */
  isLoadingMoreError: boolean;
}

/**
 * Vue composable for performing infinite search queries.
 * @param {UseInfiniteSearchOptions} options - Configuration options for the infinite search composable.
 * @returns {UseInfiniteSearchState} The infinite search state as reactive computed properties.
 * @throws {Error} if the search index ID is not provided.
 * @public
 * @example
 * // Basic usage with load more button
 * const { results, isLoading, hasNextPage, loadMore } = useInfiniteSearch({
 *   searchIndexId: 'my-index',
 *   query: 'sitecore',
 * });
 * @example
 * // With reactive query
 * const query = ref('');
 *
 * const { results, total, isLoading, isLoadingMore, hasNextPage, loadMore } = useInfiniteSearch({
 *   searchIndexId: 'my-index',
 *   query,
 *   pageSize: 20,
 * });
 */
export function useInfiniteSearch<T extends SearchDocument = SearchDocument>(
  options: UseInfiniteSearchOptions<T>
) {
  const resolvedSearchIndexId = toValue(options.searchIndexId);

  const results = shallowRef<T[]>([]);
  const total = ref(0);
  const totalPages = ref(0);
  const offset = ref(0);
  const error = ref<Error | null>(
    !resolvedSearchIndexId
      ? new Error('useInfiniteSearch: searchIndexId is required when initializing the hook')
      : null
  );
  const status = ref<SearchStatus>(!resolvedSearchIndexId ? 'error' : 'idle');
  const loadMoreStatus = ref<Omit<SearchStatus, 'success'>>('idle');

  const searchService = useSearchService().value;
  let abortController: AbortController | null = null;

  const hasNextPage = computed(() => results.value.length < total.value);

  const search = async (currentOffset: number, isLoadingMore = false) => {
    const searchIndexId = toValue(options.searchIndexId);
    const query = toValue(options.query);
    const pageSize = toValue(options.pageSize) ?? DEFAULT_PAGE_SIZE;
    const sort = toValue(options.sort);

    if (!searchService || !searchIndexId) {
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    if (isLoadingMore) {
      error.value = null;
      loadMoreStatus.value = 'loading';
    } else {
      results.value = [];
      total.value = 0;
      totalPages.value = 0;
      error.value = null;
      offset.value = 0;
      status.value = 'loading';
      loadMoreStatus.value = 'idle';
    }

    try {
      const searchParams: SearchParameters<T> = {
        searchIndexId,
        keyphrase: query,
        limit: pageSize,
        offset: currentOffset,
        sort,
      };

      const { results: searchResults, total: totalResults } = await searchService.search<T>(
        searchParams,
        { signal }
      );

      if (signal.aborted) {
        return;
      }

      results.value = isLoadingMore ? [...results.value, ...searchResults] : searchResults;
      total.value = totalResults;
      totalPages.value = Math.ceil(totalResults / pageSize);
      offset.value = currentOffset;
      status.value = 'success';
      loadMoreStatus.value = 'idle';
      error.value = null;
    } catch (err) {
      if (signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err : new Error(JSON.stringify(err));

      if (isLoadingMore) {
        error.value = errorMessage;
        loadMoreStatus.value = 'error';
      } else {
        results.value = [];
        total.value = 0;
        totalPages.value = 0;
        offset.value = 0;
        status.value = 'error';
        loadMoreStatus.value = 'idle';
        error.value = errorMessage;
      }
    }
  };

  const loadMore = () => {
    const pageSize = toValue(options.pageSize) ?? DEFAULT_PAGE_SIZE;

    if (loadMoreStatus.value === 'loading' || !hasNextPage.value) {
      return;
    }

    search(offset.value + pageSize, true);
  };

  watch(
    () =>
      [
        toValue(options.query),
        toValue(options.pageSize),
        toValue(options.sort),
        toValue(options.enabled),
      ] as const,
    ([, , , enabled]) => {
      if (enabled ?? true) {
        search(0, false);
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
    loadMoreStatus: computed(() => loadMoreStatus.value),
    hasNextPage,
    loadMore,
    isLoading: computed(() => status.value === 'loading'),
    isSuccess: computed(() => status.value === 'success'),
    isError: computed(() => status.value === 'error'),
    isLoadingMore: computed(() => loadMoreStatus.value === 'loading'),
    isLoadingMoreError: computed(() => loadMoreStatus.value === 'error'),
  };
}
