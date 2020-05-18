import { html, list, RedomComponent, setAttr, setChildren, text } from 'redom';
import { fromEvent, Observable, Subject } from 'rxjs';
import { Todo } from './api';
import { filter, map } from 'rxjs/operators';

type UI = [HTMLElement, Events, Update];
type Events = {
  nextPage: Observable<Event>;
  prevPage: Observable<Event>;
  createNewTodo: Observable<string>;
  deleteTodo: Observable<Todo>;
};
type Update = {
  showTodos: (todos: Todo[]) => void;
  showError: (error: Error) => void;
  setNextPageButtonEnabled: (enabled: boolean) => void;
  setPrevPageButtonEnabled: (enabled: boolean) => void;
  setCurrentPage: (page: number) => void;
  resetCreateTodoInput: () => void;
};

class TodoItem implements RedomComponent {
  el: HTMLLIElement;

  constructor() {
    this.el = html('li', {
      style: { 'list-style': 'none' },
      'data-testid': 'todo',
    });
  }

  update(
    todo: Todo,
    _index: number,
    _items: Todo[],
    { deleteTodo }: { deleteTodo: (todo: Todo) => void }
  ): void {
    const { title, completed } = todo;
    const truncated = title.length > 50 ? `${title.substr(0, 50)}…` : title;
    const deleteButton = html('button', {
      textContent: 'Delete',
      'data-testid': 'delete',
    });
    deleteButton.onclick = (): void => deleteTodo(todo);

    setChildren(this.el, [
      html('input', { type: 'checkbox', checked: completed, disabled: true }),
      text(` ${truncated} `),
      deleteButton,
    ]);
  }
}

export default function createUI(): UI {
  const nextPageButton = html('button', { 'data-testid': 'nextPage' }, 'Next');
  const setNextPageButtonEnabled: Update['setNextPageButtonEnabled'] = (
    enabled
  ) => setAttr(nextPageButton, { disabled: !enabled });
  const nextPage = fromEvent(nextPageButton, 'click');

  const prevPageButton = html('button', { 'data-testid': 'prevPage ' }, 'Prev');
  const setPrevPageButtonEnabled: Update['setPrevPageButtonEnabled'] = (
    enabled
  ) => setAttr(prevPageButton, { disabled: !enabled });
  const prevPage = fromEvent(prevPageButton, 'click');

  const currentPage = html('span', { 'data-testid': 'currentPage' });
  const setCurrentPage: Update['setCurrentPage'] = (page) =>
    setAttr(currentPage, 'textContent', `Page: ${page}`);

  const deleteTodo = new Subject<Todo>();
  const todoList = list(
    html('ul', {
      'data-testid': 'todoList',
      style: { 'padding-left': '0.5em' },
    }),
    TodoItem
  );
  const showTodos: Update['showTodos'] = (todos) =>
    todoList.update(todos, {
      deleteTodo: (todo: Todo) => deleteTodo.next(todo),
    });

  const createTodoInput = html('input', {
    type: 'text',
    placeholder: 'Enter new Todo and press Return to create',
    'data-testid': 'createTodoInput',
  });
  const createNewTodo: Events['createNewTodo'] = fromEvent<KeyboardEvent>(
    createTodoInput,
    'keyup'
  ).pipe(
    filter((e) => e.key === 'Enter'),
    map((e) => (e.target as HTMLInputElement).value.trim()),
    filter((v) => v.length > 0)
  );
  const resetCreateTodoInput: Update['resetCreateTodoInput'] = () => {
    setAttr(createTodoInput, 'value', '');
  };

  const ui = html('main', [
    html('section', [
      html('header', [
        html('h2', 'Todos'),
        html('p', createTodoInput),
        html('p'),
      ]),
      todoList,
    ]),
    html(
      'footer',
      html('nav', [
        currentPage,
        text('  '),
        prevPageButton,
        text('  '),
        nextPageButton,
      ])
    ),
  ]);
  const showError: Update['showError'] = (error) => {
    const reloadButton = html('button', { textContent: 'Restart' });
    reloadButton.onclick = (): void => location.reload();

    setChildren(ui, [
      html('section', [
        html('h2', { textContent: 'Oh noes! 🤯' }),
        html('p', { textContent: 'Something went wrong.' }),
        html('p', [
          html('code', {
            textContent:
              error.name && error.message
                ? `${error.name}: ${error.message}`
                : JSON.stringify(error),
          }),
        ]),
        reloadButton,
      ]),
    ]);
  };

  return [
    ui,
    {
      nextPage,
      prevPage,
      createNewTodo,
      deleteTodo: deleteTodo.asObservable(),
    },
    {
      showTodos,
      showError,
      setNextPageButtonEnabled,
      setPrevPageButtonEnabled,
      setCurrentPage,
      resetCreateTodoInput,
    },
  ];
}
