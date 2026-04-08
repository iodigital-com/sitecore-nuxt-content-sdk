import path from 'path';
import inquirer from 'inquirer';
import { prompts, NuxtAnswer } from './prompts';
import { Initializer, transform } from '../../common';
import { NuxtArgs } from './args';

export default class NuxtInitializer implements Initializer {
  async init(args: NuxtArgs) {
    const answers = await inquirer.prompt<NuxtAnswer>(prompts, args);
    const templatePath = path.resolve(__dirname, '../../templates/nuxt');

    await transform(templatePath, { ...args, ...answers });

    return {};
  }
}
