import { html, list, RedomComponent, setAttr, setChildren, text } from 'redom';
import { fromEvent, Observable } from 'rxjs';
import { Todo } from './api';
import { filter, map } from 'rxjs/operators';

type RenderResult = [HTMLElement, Events, Update];
type Events = {
  nextPage: Observable<Event>;
  prevPage: Observable<Event>;
  createNewTodo: Observable<string>;
};
type Update = {
  showTodos: (todos: Todo[]) => void;
  setNextPageButtonEnabled: (enabled: boolean) => void;
  setPrevPageButtonEnabled: (enabled: boolean) => void;
  setCurrentPage: (page: number) => void;
  resetCreateTodoInput: () => void;
};

class TodoItem implements RedomComponent {
  el: HTMLLIElement;

  constructor() {
    this.el = html('li', { style: { 'list-style': 'none' } });
  }

  update({ title, completed }: Todo): void {
    const truncated = title.length > 50 ? `${title.substr(0, 50)}…` : title;
    setChildren(this.el, [
      html('input', { type: 'checkbox', checked: completed, disabled: true }),
      text(` ${truncated}`),
    ]);
  }
}

export default function render(): RenderResult {
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

  const todoList = list(
    html('ul', {
      'data-testid': 'todoList',
      style: { 'padding-left': '0.5em' },
    }),
    TodoItem
  );
  const showTodos: Update['showTodos'] = (todos) => todoList.update(todos);

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

  return [
    html('main', [
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
    ]),
    { nextPage, prevPage, createNewTodo },
    {
      showTodos,
      setNextPageButtonEnabled,
      setPrevPageButtonEnabled,
      setCurrentPage,
      resetCreateTodoInput,
    },
  ];
}
