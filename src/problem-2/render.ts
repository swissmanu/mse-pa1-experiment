import { html, list, RedomComponent, setAttr, setChildren, text } from 'redom';
import { fromEvent, Observable } from 'rxjs';
import { Todo } from './api';

type RenderResult = [HTMLElement, Events, Update];
type Events = {
  nextPage: Observable<Event>;
  prevPage: Observable<Event>;
};
type Update = {
  showTodos: (todos: Todo[]) => void;
  setNextPageButtonEnabled: (enabled: boolean) => void;
  setPrevPageButtonEnabled: (enabled: boolean) => void;
  setCurrentPage: (page: number) => void;
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

  const currentPage = html('span');
  const setCurrentPage: Update['setCurrentPage'] = (page) =>
    setAttr(currentPage, 'textContent', `Page ${page}:`);

  const todoList = list(
    html('ul', { style: { 'padding-left': '0.5em' } }),
    TodoItem
  );
  const showTodos: Update['showTodos'] = (todos) => todoList.update(todos);

  return [
    html('main', [
      html('section', [html('h2', 'Todos'), todoList]),
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
    { nextPage, prevPage },
    {
      showTodos,
      setNextPageButtonEnabled,
      setPrevPageButtonEnabled,
      setCurrentPage,
    },
  ];
}
