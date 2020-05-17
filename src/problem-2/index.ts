import { defer } from 'rxjs';
import { flatMap, startWith, tap } from 'rxjs/operators';
import counter from '../problem-1/counter';
import onReady from '../shared';
import API, { APIInterface } from './api';
import render from './render';

export default function problem2(api: APIInterface = new API()): HTMLElement {
  const [view, events, update] = render();
  const { nextPage, prevPage } = events;
  const {
    showTodos,
    setNextPageButtonEnabled,
    setPrevPageButtonEnabled,
    setCurrentPage,
  } = update;

  defer(() => api.getNumberOfPages())
    .pipe(
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

    .subscribe(showTodos);

  return view;
}

onReady(problem2);
