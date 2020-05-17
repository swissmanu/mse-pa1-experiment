import { queries } from '@testing-library/dom';
import problem2 from '.';
import { APIInterface, Todo } from './api';

describe('Problem 2', () => {
  let mockedApi: APIInterface;
  let nextPageButton: HTMLButtonElement;
  let prevPageButton: HTMLButtonElement;

  beforeEach(async () => {
    mockedApi = {
      getTodos: jest.fn<Promise<Todo[]>, [number]>((page = 1) => {
        return Promise.resolve([]);
      }),
    };
    const app = problem2(mockedApi);

    nextPageButton = (await queries.findByTestId(
      app,
      'nextPage'
    )) as HTMLButtonElement;
    prevPageButton = (await queries.findByTestId(
      app,
      'prevPage'
    )) as HTMLButtonElement;
  });

  test('foo', () => {
    expect(nextPageButton.textContent).toEqual('Next');
    expect(prevPageButton.textContent).toEqual('Prev');
    expect(mockedApi.getTodos).toBeCalledTimes(1);
  });
});
