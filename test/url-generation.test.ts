import utils from '../src/utils';
import { getZohoUrl } from '../src/utils/urlGenerators';

describe('URL generation', () => {
  const config = { location: 'com' } as any;

  test('fields query is prefixed with ? when base url has none', () => {
    const base = getZohoUrl(config, 'deals');
    const url = `${base}${utils.getQueryFields(['Name'], base.includes('?'))}`;
    expect(url).toBe('https://www.zohoapis.com/crm/v2/deals?fields=Name');
  });

  test('fields query is prefixed with & when base url already has query', () => {
    const base = getZohoUrl(config, 'users');
    const url = `${base}${utils.getQueryFields(['Full Name'], base.includes('?'))}`;
    expect(url).toBe('https://www.zohoapis.com/crm/v2/users?type=ActiveUsers&fields=Full_Name');
  });
});
