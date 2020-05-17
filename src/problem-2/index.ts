import { defer, from } from 'rxjs';
import { flatMap, startWith, tap, switchMap } from 'rxjs/operators';
import counter from '../problem-1/counter';
import onReady from '../shared';
import API, { APIInterface } from './api';
import render from './render';

export default function problem2(api: APIInterface = new API()): HTMLElement {
  const [view, events, update] = render();
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

  return view;
}

onReady(problem2);
