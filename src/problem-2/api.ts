import todosFixture from './todos.fixture.json';

const PAGE_SIZE = 10;

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (min - max) + min);
}

export interface APIInterface {
  getNumberOfPages(): Promise<number>;
  getTodos(page?: number): Promise<Todo[]>;
  createTodo(todo: Omit<Todo, 'id' | 'completed'>): Promise<Todo>;
  deleteTodo(todo: Todo): Promise<void>;
}

class API implements APIInterface {
  private data: Todo[] = [...todosFixture];

  async getNumberOfPages(): Promise<number> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(Math.ceil(this.data.length / PAGE_SIZE)),
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
        () => resolve(this.data.slice(start, end)),
        randomInt(800, 2000) // simulate network
      );
    });
  }

  async createTodo(todo: Omit<Todo, 'id' | 'completed'>): Promise<Todo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTodo: Todo = {
          id: `${randomInt(100000, 10000000)}`,
          completed: false,
          ...todo,
        };
        this.data = [newTodo, ...this.data];
        resolve(newTodo);
      }, randomInt(500, 1000));
    });
  }

  async deleteTodo({ id }: Todo): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.data.findIndex((x) => x.id === id);
        if (index > -1) {
          this.data = [
            ...this.data.slice(0, index),
            ...this.data.slice(index + 1),
          ];
          resolve();
        } else {
          reject(new Error(`Could not find todo with id ${id}`));
        }
      }, randomInt(300, 700));
    });
  }
}

export default API;
