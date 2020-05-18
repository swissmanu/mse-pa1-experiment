import { APIInterface, Todo } from './api';
import fixtureData from './todos.fixture.json'

export default function createMockedApi(
  initialData: Todo[] = fixtureData
): APIInterface {
  let data: Todo[] = initialData;

  return {
    getNumberOfPages: jest.fn(async () => 2),
    getTodos: jest.fn<Promise<Todo[]>, [number]>(async (page = 1) => {
      return data.slice((page - 1) * 10, (page - 1) * 10 + 10);
    }),
    createTodo: jest.fn(async (todo) => {
      const newTodo: Todo = { id: '', completed: false, ...todo };
      data = [newTodo, ...data];
      return newTodo;
    }),
    deleteTodo: jest.fn(async ({ id }) => {
      const index = data.findIndex((t) => t.id === id);
      if (index > -1) {
        data = [...data.slice(0, index), ...data.slice(index + 1)];
      } else {
        throw new Error(`Did not find todo with id ${id}`);
      }
    }),
  };
}
