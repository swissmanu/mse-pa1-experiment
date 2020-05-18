import { defer } from 'rxjs';
import { flatMap, startWith, switchMap, tap } from 'rxjs/operators';
import counter from '../shared/counter';
import onReady from '../shared/onReady';
import API, { APIInterface } from './api';
import createUI from './ui';

export default function problem2(api: APIInterface = new API()): HTMLElement {
  const [ui, events, update] = createUI();
  const { nextPage, prevPage, createNewTodo } = events;
  const {
    showTodos,
    setNextPageButtonEnabled,
    setPrevPageButtonEnabled,
    setCurrentPage,
    resetCreateTodoInput,
  } = update;

  createNewTodo
    .pipe(
      tap(() => resetCreateTodoInput()),
      flatMap((title) => defer(() => api.createTodo({ title }))),
      startWith(null),
      flatMap(() => defer(() => api.getNumberOfPages())),
      switchMap((numberOfPages) =>
        counter(nextPage, prevPage, 1).pipe(
          startWith(1),
          tap(() => {
            setNextPageButtonEnabled(false);
            setPrevPageButtonEnabled(false);
          }),
          flatMap((page) =>
            defer(() => api.getTodos(page)).pipe(
              tap(() => {
                setNextPageButtonEnabled(page < numberOfPages);
                setPrevPageButtonEnabled(page > 1);
                setCurrentPage(page);
              })
            )
          )
        )
      )
    )
    .subscribe(showTodos);

  return ui;
}

onReady(problem2);
