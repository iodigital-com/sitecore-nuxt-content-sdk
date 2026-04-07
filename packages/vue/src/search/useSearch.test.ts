/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { SearchService, SortSetting } from '@sitecore-content-sdk/search';
import SitecoreProvider from '../components/SitecoreProvider.vue';
import { useSearch, UseSearchState } from './useSearch';

type Model = { id: string };

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

describe('useSearch', () => {
  let searchServiceStub: any;

  beforeEach(() => {
    searchServiceStub = vi.spyOn(SearchService.prototype, 'search');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const assertState = (el: Element | null, state: UseSearchState<Model>) => {
    expect(el?.querySelector('#isLoading')?.textContent).toBe(state.isLoading ? 'true' : 'false');
    expect(el?.querySelector('#isSuccess')?.textContent).toBe(state.isSuccess ? 'true' : 'false');
    expect(el?.querySelector('#isError')?.textContent).toBe(state.isError ? 'true' : 'false');
    expect(el?.querySelector('#error')?.textContent).toBe(
      state.error ? state.error.message : 'null'
    );
    expect(el?.querySelector('#total')?.textContent).toBe('Total: ' + state.total);
    expect(el?.querySelector('#totalPages')?.textContent).toBe('Pages: ' + state.totalPages);
    expect(el?.querySelector('#results')?.children.length).toBe(state.results.length);
    state.results.forEach((result, index) => {
      expect(el?.querySelector('#results')?.children[index].textContent).toBe(result.id);
    });
  };

  const stateTemplate = `
    <span id="isLoading">{{ isLoading ? 'true' : 'false' }}</span>
    <span id="isSuccess">{{ isSuccess ? 'true' : 'false' }}</span>
    <span id="isError">{{ isError ? 'true' : 'false' }}</span>
    <span id="status">{{ status }}</span>
    <span id="isPreviousData">{{ isPreviousData ? 'true' : 'false' }}</span>
    <span id="total">Total: {{ total }}</span>
    <span id="totalPages">Pages: {{ totalPages }}</span>
    <span id="error">{{ error ? error.message : 'null' }}</span>
    <ul id="results">
      <li v-for="result in results" :key="result.id">{{ result.id }}</li>
    </ul>
  `;

  const createTestComponent = (setupFn: () => ReturnType<typeof useSearch<Model>>) =>
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
    searchServiceStub.mockResolvedValue({
      results: [{ id: '1' }, { id: '2' }, { id: '3' }],
      total: 3,
    });

    const TestComponent = createTestComponent(() =>
      useSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    assertState(el, {
      results: [],
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      total: 0,
      totalPages: 0,
      status: 'loading',
      isPreviousData: false,
    });

    expect(searchServiceStub).toHaveBeenCalledOnce();
    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'test', limit: 10, offset: 0, sort: undefined },
      expect.any(Object)
    );

    await flushPromises();

    assertState(el, {
      results: [{ id: '1' }, { id: '2' }, { id: '3' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
    });
  });

  it('should not automatically search when search is disabled', async () => {
    searchServiceStub.mockResolvedValue({
      results: [{ id: '1' }, { id: '2' }, { id: '3' }],
      total: 3,
    });

    const TestComponent = defineComponent({
      setup() {
        const enabled = ref(false);
        const state = useSearch<Model>({
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
      error: null,
      total: 0,
      totalPages: 0,
      status: 'idle',
      isPreviousData: false,
    });

    expect(searchServiceStub).not.toHaveBeenCalled();

    (wrapper.element.querySelector('#enable') as HTMLElement | null)?.click();
    await flushPromises();

    assertState(el, {
      results: [{ id: '1' }, { id: '2' }, { id: '3' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
    });

    expect(searchServiceStub).toHaveBeenCalledOnce();
    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'test', limit: 10, offset: 0, sort: undefined },
      expect.any(Object)
    );
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
        const state = useSearch<Model>({ searchIndexId: '1234567890', query });
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
      error: null,
      total: 2,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
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
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
    });

    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'updated', limit: 10, offset: 0, sort: undefined },
      expect.any(Object)
    );
  });

  it('should return an error when the search fails', async () => {
    searchServiceStub.mockRejectedValue(new Error('Search failed'));

    const TestComponent = createTestComponent(() =>
      useSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    assertState(el, {
      results: [],
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      total: 0,
      totalPages: 0,
      status: 'loading',
      isPreviousData: false,
    });

    await flushPromises();

    assertState(el, {
      results: [],
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error('Search failed'),
      total: 0,
      totalPages: 0,
      status: 'error',
      isPreviousData: false,
    });
  });

  it('should search when custom search parameters are provided', async () => {
    searchServiceStub.mockResolvedValue({
      results: [{ id: '1' }, { id: '2' }, { id: '3' }],
      total: 3,
    });

    const sort: SortSetting<Model>[] = [{ name: 'id', order: 'desc' }];

    const TestComponent = createTestComponent(() =>
      useSearch<Model>({ searchIndexId: '1234567890', query: 'test', sort, pageSize: 20, page: 3 })
    );

    const wrapper = mountWithProvider(TestComponent);

    expect(searchServiceStub).toHaveBeenCalledWith(
      { searchIndexId: '1234567890', keyphrase: 'test', limit: 20, offset: 40, sort },
      expect.any(Object)
    );

    await flushPromises();

    assertState(wrapper.element, {
      results: [{ id: '1' }, { id: '2' }, { id: '3' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      total: 3,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
    });
  });

  it('should abort the search when the component is unmounted', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    let resolveSearch: (value: { results: Model[]; total: number }) => void;
    const searchPromise = new Promise<{ results: Model[]; total: number }>((resolve) => {
      resolveSearch = resolve;
    });

    searchServiceStub.mockReturnValue(searchPromise);

    const TestComponent = createTestComponent(() =>
      useSearch<Model>({ searchIndexId: '1234567890', query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);

    expect(searchServiceStub).toHaveBeenCalledOnce();

    wrapper.unmount();

    expect(abortSpy).toHaveBeenCalledOnce();

    resolveSearch!({ results: [{ id: '1' }, { id: '2' }, { id: '3' }], total: 3 });

    expect(searchServiceStub).toHaveBeenCalledOnce();
  });

  it('should abort previous search when a new search is triggered', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    let resolveFirstSearch: (value: { results: Model[]; total: number }) => void;
    const firstSearchPromise = new Promise<{ results: Model[]; total: number }>((resolve) => {
      resolveFirstSearch = resolve;
    });

    searchServiceStub
      .mockReturnValueOnce(firstSearchPromise)
      .mockResolvedValueOnce({ results: [{ id: 'updated-1' }, { id: 'updated-2' }], total: 2 });

    const TestComponent = defineComponent({
      setup() {
        const query = ref('initial');
        const state = useSearch<Model>({ searchIndexId: '1234567890', query });
        return { ...state, query };
      },
      template: `
        <div>
          <button id="changeQuery" @click="query = 'updated'">Change Query</button>
          ${stateTemplate}
        </div>
      `,
    });

    const wrapper = mountWithProvider(TestComponent);
    const el = wrapper.element;

    expect(searchServiceStub).toHaveBeenCalledOnce();

    (wrapper.element.querySelector('#changeQuery') as HTMLElement | null)?.click();
    await wrapper.vm.$nextTick();

    expect(searchServiceStub).toHaveBeenCalledTimes(2);
    expect(abortSpy).toHaveBeenCalledOnce();

    await flushPromises();

    assertState(el, {
      results: [{ id: 'updated-1' }, { id: 'updated-2' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      total: 2,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
    });

    resolveFirstSearch!({ results: [{ id: 'initial-1' }], total: 1 });
    await flushPromises();

    assertState(el, {
      results: [{ id: 'updated-1' }, { id: 'updated-2' }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      total: 2,
      totalPages: 1,
      status: 'success',
      isPreviousData: false,
    });
  });

  it('should return error when search index id is not provided', () => {
    const TestComponent = createTestComponent(() =>
      useSearch<Model>({ searchIndexId: null as unknown as string, query: 'test' })
    );

    const wrapper = mountWithProvider(TestComponent);

    assertState(wrapper.element, {
      results: [],
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error('useSearch: searchIndexId is required when initializing the hook'),
      total: 0,
      totalPages: 0,
      status: 'error',
      isPreviousData: false,
    });
  });
});
