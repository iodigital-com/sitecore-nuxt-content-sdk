<script setup lang="ts">
import { computed } from 'vue';
import { createError } from 'nuxt/app';
import { SitecoreProvider, Placeholder } from '@iodigital-com/sitecore-content-sdk-nuxt';
import { DesignLibraryNuxt } from '@iodigital-com/sitecore-content-sdk-nuxt/components';
import { useSitecorePage } from '@iodigital-com/sitecore-content-sdk-nuxt/composables';
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
            <a class="demo-mark" href="https://www.iodigital.com/en-nl" aria-label="iO">
              <svg viewBox="30 48 145 104" role="img" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M125.42,78.6c12.61,0,22.86,10.26,22.86,22.86s-10.26,22.86-22.86,22.86s-22.86-10.26-22.86-22.86S112.82,78.6,125.42,78.6 M125.42,55.74c-25.25,0-45.72,20.47-45.72,45.72c0,25.25,20.47,45.72,45.72,45.72c25.25,0,45.72-20.47,45.72-45.72C171.15,76.21,150.68,55.74,125.42,55.74L125.42,55.74z"
                />
                <path
                  fill="currentColor"
                  d="M54.8,86.94L54.8,86.94l-21.54,48.38l24.26,10.8l10.74-24.13C74.22,108.6,68.19,92.9,54.8,86.94z"
                />
                <path
                  fill="currentColor"
                  d="M41.34,51.88c-5.96,13.4,0.06,29.09,13.46,35.06l10.8-24.26L41.34,51.88z"
                />
              </svg>
            </a>
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
