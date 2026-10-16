<script setup lang="ts">
import { useAsyncData, useNuxtApp } from 'nuxt/app';
import type { ComponentRendering } from '@sitecore-content-sdk/nuxt';
import type { SitecoreNuxtClient } from '@sitecore-content-sdk/nuxt/client';

defineOptions({ name: 'MyGraphQLComponent' });

const props = defineProps<{
  rendering: ComponentRendering;
  fields?: Record<string, any>;
  params?: Record<string, any>;
}>();

const { $sitecoreClient } = useNuxtApp();
const client = $sitecoreClient as SitecoreNuxtClient;

const QUERY_LAYOUT = `
  query LayoutData($site: String!, $routePath: String!, $language: String!) {
    layout(site: $site, routePath: $routePath, language: $language) {
      item {
        id
        name
        displayName
        url { path }
        fields { name value }
      }
    }
  }
`;

const { data, status, error } = await useAsyncData(
  `graphql-component-${props.rendering.uid}`,
  async () => {
    const res = await client.getData<{ layout: { item: any } }>(QUERY_LAYOUT, {
      site: client.initOptions.defaultSite,
      routePath: '/',
      language: client.initOptions.defaultLanguage || 'en',
    });

    return res?.layout?.item ?? null;
  }
);
</script>

<template>
  <div class="graphql-component">
    <p v-if="status === 'pending'">Loading...</p>
    <div v-else-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
    <div v-else-if="data">
      <p class="item-label">Current item</p>
      <h3>{{ data.displayName }}</h3>
      <p class="item-path">{{ data.url?.path }}</p>
      <ul class="item-fields">
        <li v-for="field in data.fields" :key="field.name">
          <strong>{{ field.name }}</strong>
          <span>{{ field.value }}</span>
        </li>
      </ul>
    </div>
    <p v-else>No item data was returned.</p>
  </div>
</template>

<style scoped>
.graphql-component h3 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.item-label,
.item-path {
  margin: 8px 0 0;
  color: #727272;
  font-size: 0.9rem;
}

.item-label {
  color: #0000d2;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.item-fields {
  display: grid;
  gap: 10px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.item-fields li {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) 1fr;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #e4dfd4;
}

.item-fields strong {
  font-weight: 600;
}

.item-fields span {
  overflow-wrap: anywhere;
}
</style>
