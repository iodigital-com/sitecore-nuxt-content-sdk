import { QuestionCollection } from 'inquirer';
import { baseAppPrompts, BaseAppAnswer } from '../../common';

export type NuxtAnswer = BaseAppAnswer;

export const prompts: QuestionCollection<NuxtAnswer> = [...baseAppPrompts];
