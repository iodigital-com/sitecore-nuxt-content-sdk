/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { SearchService } from '@sitecore-content-sdk/search';
import SitecoreProvider from '../components/SitecoreProvider.vue';
import { SitecoreProviderKey } from '../composables/useSitecoreContext';
import { getOffset, useSearchService } from './utils';

const mockApi = {
  edge: {
    contextId: 'id',
    edgeUrl: 'url',
    clientContextId: 'clientId',
  },
} as any;

describe('search utils', () => {
  let searchServiceStub: any;

  beforeEach(() => {
    searchServiceStub = vi.spyOn(SearchService.prototype, 'search');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useSearchService', () => {
    it('should return a search service', async () => {
      searchServiceStub.mockResolvedValue({
        results: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total: 3,
      });

      const TestComponent = defineComponent({
        setup() {
          const searchService = useSearchService();
          const results = ref<{ id: number }[]>([]);
          const total = ref(0);

          const fetchResults = async () => {
            if (!searchService.value) return;
            const response = await searchService.value.search<{ id: number }>({
              searchIndexId: '1234567890',
              keyphrase: 'test',
            });
            results.value = response?.results ?? [];
            total.value = response?.total ?? 0;
          };

          fetchResults();

          return { results, total };
        },
        template: `
          <div>
            <span id="total">Total: {{ total }}</span>
            <ul id="results">
              <li v-for="result in results" :key="result.id">{{ result.id }}</li>
            </ul>
          </div>
        `,
      });

      const wrapper = mount(SitecoreProvider, {
        props: {
          api: mockApi,
          page: {} as any,
          componentMap: new Map(),
          loadImportMap: () => Promise.resolve({ default: [] }),
        },
        slots: {
          default: TestComponent,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      console.log(wrapper.html());

      const total = wrapper.element.querySelector('#total');
      const results = wrapper.element.querySelectorAll('#results li');

      expect(total?.textContent).toBe('Total: 3');
      expect(results).toHaveLength(3);
      expect(results[0].textContent).toBe('1');
      expect(results[1].textContent).toBe('2');
      expect(results[2].textContent).toBe('3');
    });

    it('should return null if api configuration is not provided', () => {
      const TestComponent = defineComponent({
        setup() {
          const searchService = useSearchService();
          return { searchService };
        },
        template: `<span id="searchService">{{ searchService ? 'true' : 'false' }}</span>`,
      });

      const wrapper = mount(TestComponent, {
        global: {
          provide: {
            [SitecoreProviderKey as symbol]: {
              api: undefined,
              page: ref({}),
              componentMap: new Map(),
              loadImportMap: () => Promise.resolve({ default: [] }),
            },
          },
        },
      });
      console.log(wrapper.html());
      expect(wrapper.text()).toBe('false');
    });
  });

  describe('getOffset', () => {
    it('should return the correct offset', () => {
      expect(getOffset(1, 10)).toBe(0);
      expect(getOffset(2, 10)).toBe(10);
      expect(getOffset(3, 10)).toBe(20);
    });
  });
});
