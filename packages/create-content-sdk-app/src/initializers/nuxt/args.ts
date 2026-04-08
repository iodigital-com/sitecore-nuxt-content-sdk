import { BaseAppArgs } from '../../common';
import { NuxtAnswer } from './prompts';

export type NuxtArgs = BaseAppArgs & Partial<NuxtAnswer>;
