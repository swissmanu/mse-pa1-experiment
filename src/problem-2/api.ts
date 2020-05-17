import todosFixture from './todos.fixture.json';

const PAGE_SIZE = 10;

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function randomInt(min: number, max: number): number {
  return Math.random() * (min - max) + min;
}

export interface APIInterface {
  getNumberOfPages(): Promise<number>;
  getTodos(page?: number): Promise<Todo[]>;
}

class API implements APIInterface {
  async getNumberOfPages(): Promise<number> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(Math.ceil(todosFixture.length / PAGE_SIZE)),
        randomInt(500, 1000)
      )
    );
  }

  async getTodos(page = 1): Promise<Todo[]> {
    if (page < 1) {
      throw new Error('Expected page to be greater or equal to 1');
    }

    return new Promise<Todo[]>((resolve) => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setTimeout(
        () => resolve(todosFixture.slice(start, end)),
        randomInt(800, 2000) // simulate network
      );
    });
  }
}

export default API;
