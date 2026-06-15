import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }
 
  let messages;
  if (locale === 'th') {
    messages = (await import('../../messages/th.json')).default;
  } else if (locale === 'cn') {
    messages = (await import('../../messages/cn.json')).default;
  } else {
    messages = (await import('../../messages/en.json')).default;
  }

  return {
    locale,
    messages
  };
});
