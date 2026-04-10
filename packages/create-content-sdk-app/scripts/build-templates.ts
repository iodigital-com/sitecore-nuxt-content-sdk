import path from 'path';
import fs from 'fs-extra';

const templatesFolder = path.resolve(__dirname, '../src/templates');
const distFolder = path.resolve(__dirname, '../dist/templates');

fs.copy(
  templatesFolder,
  distFolder,
  {
    filter: (src) => !src.includes('node_modules') && !src.includes('.nuxt'),
  },
  (err) => {
    if (err) {
      console.log('An error occurred while copying the folder.');
      throw err;
    }
  }
);
