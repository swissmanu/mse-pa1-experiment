import { merge } from 'rxjs';
import { flatMap, map, startWith, tap } from 'rxjs/operators';
import onReady from '../shared';
import counter from './counter';
import render from './render';

export default function problem1(): HTMLElement {
  const [view, events, update] = render();
  const { increment, decrement, input, reset } = events;
  const { logValue, setButtonsEnabled, setInput } = update;

  reset
    .pipe(
      tap(() => {
        setButtonsEnabled(true);
        setInput('');
      }),
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
