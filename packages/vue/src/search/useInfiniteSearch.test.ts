/* eslint-disable no-unused-expressions */
/* eslint-disable vue/one-component-per-file */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { SearchService, SortSetting } from '@sitecore-content-sdk/search';
import SitecoreProvider from '../components/SitecoreProvider.vue';
import { useInfiniteSearch } from './useInfiniteSearch';

type Model = { id: string | number };

const defaultProviderProps = {
  api: {
    edge: {
      contextId: 'id',
      edgeUrl: 'url',
      clientContextId: 'clientId',
    },
  } as any,
  page: {} as any,
  componentMap: new Map(),
  loadImportMap: () => Promise.resolve({ default: [] }),
};

describe('useInfiniteSearch', () => {
  let searchServiceStub: any;

  beforeEach(() => {
    searchServiceStub = vi.spyOn(SearchService.prototype, 'search');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  type ExpectedState = {
    results: Model[];
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    isLoadingMore: boolean;
    isLoadingMoreError: boolean;
    hasNextPage: boolean;
    error: Error | null;
    total: number;
    totalPages: number;
    status: string;
    loadMoreStatus: string;
  };

  const assertState = (el: Element | null, state: ExpectedState) => {
    expect(el?.querySelector('#isLoading')?.textContent).toBe(state.isLoading ? 'true' : 'false');
    expect(el?.querySelector('#isSuccess')?.textContent).toBe(state.isSuccess ? 'true' : 'false');
    expect(el?.querySelector('#isError')?.textContent).toBe(state.isError ? 'true' : 'false');
    expect(el?.querySelector('#isLoadingMore')?.textContent).toBe(
      state.isLoadingMore ? 'true' : 'false'
    );
    expect(el?.querySelector('#isLoadingMoreError')?.textContent).toBe(
      state.isLoadingMoreError ? 'true' : 'false'
    );
    expect(el?.querySelector('#hasNextPage')?.textContent).toBe(
      state.hasNextPage ? 'true' : 'false'
    );
    expect(el?.querySelector('#total')?.textContent).toBe('Total: ' + state.total);
    expect(el?.querySelector('#totalPages')?.textContent).toBe('Pages: ' + state.totalPages);
    expect(el?.querySelector('#error')?.textContent).toBe(
      state.error ? state.error.message : 'null'
    );
    expect(el?.querySelector('#status')?.textContent).toBe(state.status);
    expect(el?.querySelector('#loadMoreStatus')?.textContent).toBe(state.loadMoreStatus);
    expect(el?.querySelector('#results')?.children.length).toBe(state.results.length);
    state.results.forEach((result, index) => {
      expect(el?.querySelector('#results')?.children[index].textContent).toBe(result.id.toString());
    });
  };

  const stateTemplate = `
    <span id="isLoading">{{ isLoading ? 'true' : 'false' }}</span>
    <span id="isSuccess">{{ isSuccess ? 'true' : 'false' }}</span>
    <span id="isError">{{ isError ? 'true' : 'false' }}</span>
    <span id="isLoadingMore">{{ isLoadingMore ? 'true' : 'false' }}</span>
    <span id="isLoadingMoreError">{{ isLoadingMoreError ? 'true' : 'false' }}</span>
    <span id="hasNextPage">{{ hasNextPage ? 'true' : 'false' }}</span>
    <span id="total">Total: {{ total }}</span>
    <span id="totalPages">Pages: {{ totalPages }}</span>
    <span id="error">{{ error ? error.message : 'null' }}</span>
    <span id="status">{{ status }}</span>
    <span id="loadMoreStatus">{{ loadMoreStatus }}</span>
    <button id="loadMore" @click="loadMore">Load More</button>
    <ul id="results">
      <li v-for="result in results" :key="result.id">{{ result.id }}</li>
    </ul>
  `;

  const createTestComponent = (setupFn: () => ReturnType<typeof useInfiniteSearch<Model>>) =>
    defineComponent({
      setup() {
        return { ...setupFn() };
      },
      template: `<div>${stateTemplate}</div>`,
    });

  const mountWithProvider = (component: ReturnType<typeof defineComponent>) =>
    mount(SitecoreProvider, {
      props: defaultProviderProps,
      slots: { default: component },
    });

  it('should search', async () => {
    searchServiceStub.mockResolvedValue({ results: [{ id: 1 }, { id: 2 }, { id: 3 }], total: 3 });

    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    assertState(el, {
      results: [],
      isLoading: true,
      isSuccess: false,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 0,
      totalPages: 0,
      status: 'loading',
      loadMoreStatus: 'idle',
    });

    expect(searchServiceStub).toHaveBeenCalledOnce();
    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'test', limit: 10, offset: 0, sort: undefined },
      expect.any(Object)
    );

    await flushPromises();

    assertState(el, {
      results: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });
  });

  it('should not automatically search when search is disabled', async () => {
    searchServiceStub.mockResolvedValue({ results: [{ id: 1 }, { id: 2 }, { id: 3 }], total: 3 });

    const TestComponent = defineComponent({
      setup() {
        const enabled = ref(false);
        const state = useInfiniteSearch<Model>({
          searchIndexId: '1234567890',
          query: 'test',
          enabled,
        });
        return { ...state, enabled };
      },
      template: `
        <div>
          <button id="enable" @click="enabled = true">Enable</button>
          ${stateTemplate}
        </div>
      `,
    });

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    assertState(el, {
      results: [],
      isLoading: false,
      isSuccess: false,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 0,
      totalPages: 0,
      status: 'idle',
      loadMoreStatus: 'idle',
    });

    expect(searchServiceStub).not.toHaveBeenCalled();

    (wrapper.element.querySelector('#enable') as HTMLElement | null)?.click();
    await flushPromises();

    assertState(el, {
      results: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });

    expect(searchServiceStub).toHaveBeenCalledOnce();
  });

  it('should search when the query is changed', async () => {
    searchServiceStub
      .mockResolvedValueOnce({ results: [{ id: 'initial-1' }, { id: 'initial-2' }], total: 2 })
      .mockResolvedValueOnce({
        results: [{ id: 'updated-1' }, { id: 'updated-2' }, { id: 'updated-3' }],
        total: 3,
      });

    const TestComponent = defineComponent({
      setup() {
        const query = ref('initial');
        const state = useInfiniteSearch<Model>({ searchIndexId: '1234567890', query });
        return { ...state, query };
      },
      template: `
        <div>
          <button id="changeQuery" @click="query = 'updated'">Change Query</button>
          <span id="query">Query: {{ query }}</span>
          ${stateTemplate}
        </div>
      `,
    });

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    await flushPromises();

    assertState(el, {
      results: [{ id: 'initial-1' }, { id: 'initial-2' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 2,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });

    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'initial', limit: 10, offset: 0, sort: undefined },
      expect.any(Object)
    );

    (wrapper.element.querySelector('#changeQuery') as HTMLElement | null)?.click();
    await flushPromises();

    assertState(el, {
      results: [{ id: 'updated-1' }, { id: 'updated-2' }, { id: 'updated-3' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });

    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'updated', limit: 10, offset: 0, sort: undefined },
      expect.any(Object)
    );
  });

  it('should search when custom search parameters are provided', async () => {
    searchServiceStub.mockResolvedValue({ results: [{ id: 1 }, { id: 2 }, { id: 3 }], total: 3 });

    const sort: SortSetting<Model>[] = [{ name: 'id', order: 'desc' }];

    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: '1234567890', query: 'test', sort, pageSize: 20 })
    );

    const wrapper = mountWithProvider(TestComponent);

    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'test', limit: 20, offset: 0, sort },
      expect.any(Object)
    );

    await flushPromises();

    assertState(wrapper.element, {
      results: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });
  });

  it('should load more results', async () => {
    const firstCallResults = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
    const secondCallResults = Array.from({ length: 10 }, (_, i) => ({ id: i + 11 }));

    searchServiceStub
      .mockResolvedValueOnce({ results: firstCallResults, total: 20 })
      .mockResolvedValueOnce({ results: secondCallResults, total: 20 });

    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    await flushPromises();

    assertState(el, {
      results: firstCallResults,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: true,
      error: null,
      total: 20,
      totalPages: 2,
      status: 'success',
      loadMoreStatus: 'idle',
    });

    (wrapper.element.querySelector('#loadMore') as HTMLElement | null)?.click();
    await wrapper.vm.$nextTick();

    assertState(el, {
      results: firstCallResults,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: true,
      isLoadingMoreError: false,
      hasNextPage: true,
      error: null,
      total: 20,
      totalPages: 2,
      status: 'success',
      loadMoreStatus: 'loading',
    });

    await flushPromises();

    assertState(el, {
      results: [...firstCallResults, ...secondCallResults],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 20,
      totalPages: 2,
      status: 'success',
      loadMoreStatus: 'idle',
    });
  });

  it('should return error when initial search fails', async () => {
    searchServiceStub.mockRejectedValue(new Error('Search failed'));

    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    await flushPromises();

    assertState(el, {
      results: [],
      isLoading: false,
      isSuccess: false,
      isError: true,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: new Error('Search failed'),
      total: 0,
      totalPages: 0,
      status: 'error',
      loadMoreStatus: 'idle',
    });
  });

  it('should return error when load more fails', async () => {
    const firstCallResults = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

    searchServiceStub
      .mockResolvedValueOnce({ results: firstCallResults, total: 20 })
      .mockRejectedValueOnce(new Error('Load more failed'));

    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    await flushPromises();

    (wrapper.element.querySelector('#loadMore') as HTMLElement | null)?.click();
    await wrapper.vm.$nextTick();

    assertState(el, {
      results: firstCallResults,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: true,
      isLoadingMoreError: false,
      hasNextPage: true,
      error: null,
      total: 20,
      totalPages: 2,
      status: 'success',
      loadMoreStatus: 'loading',
    });

    await flushPromises();

    assertState(el, {
      results: firstCallResults,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: true,
      hasNextPage: true,
      error: new Error('Load more failed'),
      total: 20,
      totalPages: 2,
      status: 'success',
      loadMoreStatus: 'error',
    });
  });

  it('should return error when search index id is not provided', () => {
    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: null as unknown as string, query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);

    assertState(wrapper.element, {
      results: [],
      isLoading: false,
      isSuccess: false,
      isError: true,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: new Error('useInfiniteSearch: searchIndexId is required when initializing the hook'),
      total: 0,
      totalPages: 0,
      status: 'error',
      loadMoreStatus: 'idle',
    });
  });

  it('should not execute "load more" when a previous "load more" is in progress', async () => {
    let resolveFirstLoadMore: (value: { results: Model[]; total: number }) => void;
    const firstLoadMorePromise = new Promise<{ results: Model[]; total: number }>((resolve) => {
      resolveFirstLoadMore = resolve;
    });

    const initialResults = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const loadMoreResults = [{ id: 4 }, { id: 5 }, { id: 6 }];

    searchServiceStub
      .mockResolvedValueOnce({ results: initialResults, total: 6 })
      .mockReturnValueOnce(firstLoadMorePromise)
      .mockResolvedValueOnce({ results: loadMoreResults, total: 6 });

    const TestComponent = createTestComponent(() =>
      useInfiniteSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    await flushPromises();

    assertState(el, {
      results: initialResults,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: true,
      error: null,
      total: 6,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });

    (wrapper.element.querySelector('#loadMore') as HTMLElement | null)?.click();
    await wrapper.vm.$nextTick();

    assertState(el, {
      results: initialResults,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: true,
      isLoadingMoreError: false,
      hasNextPage: true,
      error: null,
      total: 6,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'loading',
    });

    (wrapper.element.querySelector('#loadMore') as HTMLElement | null)?.click();
    await wrapper.vm.$nextTick();

    expect(searchServiceStub).toHaveBeenCalledTimes(2);

    resolveFirstLoadMore!({ results: loadMoreResults, total: 6 });
    await flushPromises();

    assertState(el, {
      results: [...initialResults, ...loadMoreResults],
      isLoading: false,
      isSuccess: true,
      isError: false,
      isLoadingMore: false,
      isLoadingMoreError: false,
      hasNextPage: false,
      error: null,
      total: 6,
      totalPages: 1,
      status: 'success',
      loadMoreStatus: 'idle',
    });

    expect(searchServiceStub).toHaveBeenCalledTimes(2);
  });
});
