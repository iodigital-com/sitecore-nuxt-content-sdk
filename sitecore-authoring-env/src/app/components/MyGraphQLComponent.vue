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
      <h3>{{ data.displayName }}</h3>
      <p>Path: {{ data.url?.path }}</p>
      <ul>
        <li v-for="field in data.fields" :key="field.name">
          <strong>{{ field.name }}</strong
          >: {{ field.value }}
        </li>
      </ul>
    </div>
    <p v-else>Query kon niets ophalen...</p>
  </div>
</template>
