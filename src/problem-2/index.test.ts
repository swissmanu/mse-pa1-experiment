import { queries, waitFor, fireEvent, within } from '@testing-library/dom';
import problem2 from '.';
import { APIInterface, Todo } from './api';
import fixtureData from './todos.fixture.json';

describe('Problem 2', () => {
  let mockedApi: APIInterface;
  let nextPageButton: HTMLButtonElement;
  let prevPageButton: HTMLButtonElement;
  let currentPage: HTMLSpanElement;
  let createTodoInput: HTMLInputElement;
  let todoList: HTMLUListElement;

  beforeEach(async () => {
    let data = [...fixtureData];

    mockedApi = {
      getNumberOfPages: jest.fn(async () => 2),
      getTodos: jest.fn<Promise<Todo[]>, [number]>(async (page = 1) => {
        return data.slice((page - 1) * 10, (page - 1) * 10 + 10);
      }),
      createTodo: jest.fn(async (todo) => {
        const newTodo: Todo = { id: '', completed: false, ...todo };
        data = [newTodo, ...data];
        return newTodo;
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
    currentPage = await queries.findByTestId(app, 'currentPage');
    createTodoInput = (await queries.findByTestId(
      app,
      'createTodoInput'
    )) as HTMLInputElement;
    todoList = (await queries.findByTestId(
      app,
      'todoList'
    )) as HTMLUListElement;
  });

  test('shows first page with ten todos by default', async () => {
    expect(mockedApi.getNumberOfPages).toBeCalledTimes(1);
    expect(mockedApi.getTodos).toBeCalledTimes(1);
    expect(mockedApi.getTodos).toBeCalledWith(1);

    expect(currentPage.textContent).toEqual('Page: 1');
    await waitFor(() => expect(todoList.children).toHaveLength(10));
  });

  describe('Pagination', () => {
    test('Buttons change their disabled state according to the current page', async () => {
      expect(prevPageButton.disabled).toBe(true);
      expect(nextPageButton.disabled).toBe(false);

      fireEvent.click(nextPageButton);
      expect(mockedApi.getTodos).toHaveBeenLastCalledWith(2);
      await waitFor(() => expect(currentPage.textContent).toEqual('Page: 2'));
      expect(prevPageButton.disabled).toBe(false);
      expect(nextPageButton.disabled).toBe(true);

      fireEvent.click(prevPageButton);
      await waitFor(() => expect(currentPage.textContent).toEqual('Page: 1'));
      expect(prevPageButton.disabled).toBe(true);
      expect(nextPageButton.disabled).toBe(false);
    });
  });

  describe('Create a Todo', () => {
    const title = 'Fancy, Shiny new Todo';

    test('clears the input field, creates the todo and shows it in the list on first position', async () => {
      createTodoInput.value = title;
      fireEvent.keyUp(createTodoInput, { key: 'Enter' });
      expect(createTodoInput.value).toEqual('');
      expect(mockedApi.createTodo).toHaveBeenCalledWith({ title });
      await waitFor(() =>
        expect(mockedApi.getNumberOfPages).toHaveBeenCalledTimes(2)
      );
      await waitFor(() => within(todoList).getByText(title));
    });

    test('being on another page than the first creates the todo and shows it on the first page', async () => {
      fireEvent.click(nextPageButton);

      createTodoInput.value = title;
      fireEvent.keyUp(createTodoInput, { key: 'Enter' });
      expect(createTodoInput.value).toEqual('');
      expect(mockedApi.createTodo).toHaveBeenCalledWith({ title });
      await waitFor(() =>
        expect(mockedApi.getNumberOfPages).toHaveBeenCalledTimes(2)
      );
      await waitFor(() => within(todoList).getByText(title));
      expect(currentPage.textContent).toEqual('Page: 1');
    });
  });
});
