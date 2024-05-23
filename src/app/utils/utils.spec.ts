import { objectToQueryString } from './object-to-query-string';

describe('Utilities', () => {
  it('should be create query string from object', () => {
    const query = {
      skip: 0,
      take: 10,
      filter: {
        logic: 'and',
        filters: [{
          field: 'clockIn',
          operator: 'eq',
          value: '2024-05-19'
        }, {
          field: 'jobId',
          operator: 'in',
          value: '12345,23456,78901'
        }]
      }
    };

    const queryString = objectToQueryString(query);
    const queryParams = queryString.split('&');
    expect(queryParams[0]).toBe('skip=0');
    expect(queryParams[1]).toBe('take=10');
    expect(decodeURIComponent(queryParams[2])).toBe('filter[logic]=and');
    expect(decodeURIComponent(queryParams[3])).toBe('filter[filters][0][field]=clockIn');
    expect(decodeURIComponent(queryParams[4])).toBe('filter[filters][0][operator]=eq');
    expect(decodeURIComponent(queryParams[5])).toBe('filter[filters][0][value]=2024-05-19');
    expect(decodeURIComponent(queryParams[6])).toBe('filter[filters][1][field]=jobId');
    expect(decodeURIComponent(queryParams[7])).toBe('filter[filters][1][operator]=in');
    expect(decodeURIComponent(queryParams[8])).toBe('filter[filters][1][value]=12345,23456,78901');
  });
});
