<script setup lang="ts">
import { computed } from 'vue';
import { createError } from 'nuxt/app';
import { SitecoreProvider, Placeholder } from '@sitecore-content-sdk/nuxt';
import { DesignLibraryNuxt } from '@sitecore-content-sdk/nuxt/components';
import { useSitecorePage } from '@sitecore-content-sdk/nuxt/composables';
import componentMap from '../components/componentMap';
import '../assets/demo.css';
const { page, error } = await useSitecorePage();

if (error.value) {
  throw createError({ statusCode: 500, message: error.value.message });
}

if (!page.value) {
  throw createError({ statusCode: 404, message: 'Page not found' });
}

const route = computed(() => page.value?.layout?.sitecore?.route);
const isDesignLibrary = computed(() => page.value?.mode?.isDesignLibrary);
</script>

<template>
  <SitecoreProvider :page="page" :api="($sitecoreConfig as any).api" :componentMap="componentMap">
    <template v-if="isDesignLibrary">
      <DesignLibraryNuxt />
    </template>
    <template v-else>
      <div class="demo-page">
        <header class="demo-header">
          <div class="demo-header__bar">
            <a class="demo-mark" href="https://www.iodigital.com/en-nl">iO</a>
            <span class="demo-kicker">Nuxt Content SDK</span>
          </div>
          <div class="demo-hero">
            <p class="demo-eyebrow">Sitecore demo</p>
            <h1>Nuxt Content SDK</h1>
            <p>
              A working head for Sitecore content: the current item, a timed update, and the text,
              image and rich text on this page.
            </p>
          </div>
        </header>
        <main class="demo-main">
          <Placeholder name="headless-header" :rendering="route" />
          <Placeholder name="headless-main" :rendering="route" />
          <Placeholder name="headless-footer" :rendering="route" />
        </main>
        <footer class="demo-footer">
          <div class="demo-footer__inner">
            <span>Demo implementation</span>
            <a href="https://www.iodigital.com/en-nl">iodigital.com</a>
          </div>
        </footer>
      </div>
    </template>
  </SitecoreProvider>
</template>
