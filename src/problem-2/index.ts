import { defer, merge, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  flatMap,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import counter from '../shared/counter';
import onReady from '../shared/onReady';
import API, { APIInterface } from './api';
import createUI from './ui';

export default function problem2(api: APIInterface = new API()): HTMLElement {
  const [ui, events, update] = createUI();
  const { nextPage, prevPage, createNewTodo, deleteTodo } = events;
  const {
    showTodos,
    showError,
    setNextPageButtonEnabled,
    setPrevPageButtonEnabled,
    setCurrentPage,
    resetCreateTodoInput,
  } = update;

  createNewTodo
    .pipe(
      tap(() => resetCreateTodoInput()),
      flatMap((title) => defer(() => api.createTodo({ title })))
    )
    .pipe(
      startWith(null),
      switchMap((x) =>
        merge(of(x), deleteTodo).pipe(
          flatMap(() => defer(() => api.getNumberOfPages())),
          distinctUntilChanged()
        )
      ),
      // flatMap instead
      switchMap((numberOfPages) =>
        counter(nextPage, prevPage, 1).pipe(
          startWith(1),
          tap(() => {
            setNextPageButtonEnabled(false);
            setPrevPageButtonEnabled(false);
          }),
          // flatMap
          switchMap((page) =>
            merge(
              of(page),
              // move to merge with createNewTodo
              deleteTodo.pipe(
                debounceTime(300), // remove me
                flatMap((todo) => defer(() => api.deleteTodo(todo))),
                flatMap(() => of(page))
              )
            ).pipe(
              flatMap(() =>
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
      )
    )
    .subscribe({
      next: showTodos,
      error: showError,
    });

  return ui;
}

onReady(problem2);
