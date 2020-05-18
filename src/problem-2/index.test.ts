import { fireEvent, queries, waitFor, within } from '@testing-library/dom';
import problem2 from '.';
import { APIInterface } from './api';
import createMockedApi from './api.mock';

describe('Problem 2', () => {
  describe('Integration Test', () => {
    let app: HTMLElement;
    let mockedApi: APIInterface;
    let nextPageButton: HTMLButtonElement;
    let prevPageButton: HTMLButtonElement;
    let currentPage: HTMLSpanElement;
    let createTodoInput: HTMLInputElement;
    let todoList: HTMLUListElement;

    beforeEach(async () => {
      mockedApi = createMockedApi();
      app = problem2(mockedApi);

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

    describe('when changing pages,', () => {
      test('the prev and next buttons do always have an appropriate enabled/disabled state', async () => {
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

    describe('creating a todo', () => {
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
        await waitFor(() => expect(currentPage.textContent).toEqual('Page: 2'));

        createTodoInput.value = '2';
        fireEvent.keyUp(createTodoInput, { key: 'Enter' });
        await waitFor(() => within(todoList).getByText('2'));
        await waitFor(() => expect(currentPage.textContent).toEqual('Page: 1'));

        fireEvent.click(nextPageButton);
        fireEvent.click(nextPageButton);
        await waitFor(() => expect(currentPage.textContent).toEqual('Page: 3'));

        createTodoInput.value = '3';
        fireEvent.keyUp(createTodoInput, { key: 'Enter' });
        await waitFor(() => within(todoList).getByText('3'));
        await waitFor(() => expect(currentPage.textContent).toEqual('Page: 1'));
      });
    });

    describe('deleting a todo', () => {
      test('removes the todo from the list', async () => {
        const [firstTodo, secondTodo] = within(todoList).getAllByTestId('todo');
        const { textContent: secondTodoTitle } = secondTodo;
        const deleteButton = within(firstTodo).getByTestId('delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
          const [firstTodoAfterUpdate] = within(todoList).getAllByTestId(
            'todo'
          );
          expect(firstTodoAfterUpdate.textContent).toEqual(secondTodoTitle);
        });
      });

      test('removes the todo from the list once', async () => {
        const [firstTodo, secondTodo] = within(todoList).getAllByTestId('todo');
        const { textContent: secondTodoTitle } = secondTodo;
        const deleteButton = within(firstTodo).getByTestId('delete');
        fireEvent.click(deleteButton);
        fireEvent.click(deleteButton);

        await waitFor(() => {
          const [firstTodoAfterUpdate] = within(todoList).getAllByTestId(
            'todo'
          );
          expect(firstTodoAfterUpdate.textContent).toEqual(secondTodoTitle);
        });
      });

      test('stays on the page of the deleted todo', async () => {
        fireEvent.click(nextPageButton);
        await waitFor(() => expect(currentPage.textContent).toEqual('Page: 2'));
        const [firstTodo, { textContent: secondTodoTitle }] = within(
          todoList
        ).getAllByTestId('todo');
        const deleteButton = within(firstTodo).getByTestId('delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
          const [firstTodoAfterUpdate] = within(todoList).getAllByTestId(
            'todo'
          );
          expect(firstTodoAfterUpdate.textContent).toEqual(secondTodoTitle);
        });
        expect(currentPage.textContent).toEqual('Page: 2');
      });

      test('works for a just created todo', async () => {
        const [{ textContent: firstTodoBeforeUpdate }] = within(
          todoList
        ).getAllByTestId('todo');
        const title = 'do it!';
        createTodoInput.value = title;
        fireEvent.keyUp(createTodoInput, { key: 'Enter' });

        await waitFor(() => within(todoList).getByText(title));
        const justCreatedTodo = within(todoList).getByText(title);
        fireEvent.click(within(justCreatedTodo).getByTestId('delete'));
        await waitFor(() => {
          const [firstTodoAfterUpdate] = within(
            queries.getByTestId(app, 'todoList')
          ).getAllByTestId('todo');
          expect(firstTodoAfterUpdate.textContent).toEqual(
            firstTodoBeforeUpdate
          );
        });
      });
    });
  });
});
