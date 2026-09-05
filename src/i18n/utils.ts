import en from './en';
import es from './es';
import gl from './gl';

const dictionaries = { en, es, gl };

export function getDictionary(locale: keyof typeof dictionaries) {
  return dictionaries[locale];
}
