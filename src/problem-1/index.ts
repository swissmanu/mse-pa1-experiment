import { map, tap, flatMap, startWith } from 'rxjs/operators';
import onReady from '../shared';
import render from './render';
import { merge } from 'rxjs';
import counter from './counter';

export default function problem1(): HTMLElement {
  const [view, events, update] = render();
  const { increment, decrement, input, reset } = events;
  const { logValue, setButtonsEnabled } = update;

  reset
    .pipe(
      startWith(null),
      flatMap(() =>
        merge(
          input.pipe(tap(() => setButtonsEnabled(false))),
          counter(increment, decrement).pipe(map((count) => `${count}`))
        )
      )
    )
    .subscribe((v) => {
      logValue(v);
    });

  return view;
}

onReady(problem1);
