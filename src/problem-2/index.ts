import { defer, merge, of } from 'rxjs';
import { distinctUntilChanged, flatMap, startWith, switchMap, tap } from 'rxjs/operators';
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

  merge(
    createNewTodo.pipe(
      tap(() => resetCreateTodoInput()),
      flatMap((title) => defer(() => api.createTodo({ title })))
    ),
    deleteTodo.pipe(flatMap((todo) => defer(() => api.deleteTodo(todo))))
  )
    .pipe(
      startWith(null),
      switchMap((x) =>
        merge(of(x), deleteTodo).pipe(
          flatMap(() => defer(() => api.getNumberOfPages())),
          distinctUntilChanged()
        )
      ),
      flatMap((numberOfPages) =>
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
    .subscribe({
      next: showTodos,
      error: showError,
    });

  return ui;
}

onReady(problem2);
