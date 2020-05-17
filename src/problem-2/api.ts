export type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export interface APIInterface {
  getTodos(page?: number): Promise<Todo[]>;
}

class API implements APIInterface {
  public async getTodos(page = 1): Promise<Todo[]> {
    if (page < 1) {
      throw new Error('Expected page to be greater or equal to 1');
    }

    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=10`
    );

    if (response.ok) {
      const json = await response.json();
      return json as Todo[];
    }

    throw new Error('Response nok');
  }
}

export default API;
