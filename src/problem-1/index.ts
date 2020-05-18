import { merge, Observable } from 'rxjs';
import { flatMap, map, startWith, tap } from 'rxjs/operators';
import onReady from '../shared/onReady';
import counter from '../shared/counter';
import { default as createUI, Events, Update } from './ui';

export function createEngine(
  { increment, decrement, input, reset }: Events,
  { showValue, setButtonsEnabled, setInput }: Update
): Observable<string> {
  return reset.pipe(
    startWith(null),
    tap(() => {
      setButtonsEnabled(true);
      setInput('');
      showValue('');
    }),
    flatMap(() =>
      merge(
        input.pipe(tap(() => setButtonsEnabled(false))),
        counter(increment, decrement).pipe(map((count) => `${count}`))
      )
    )
  );
}

export default function problem1(): HTMLElement {
  const [ui, events, update] = createUI();
  const { showValue } = update;
  const engine = createEngine(events, update);

  engine.subscribe((v) => {
    showValue(v);
  });

  return ui;
}

onReady(problem1);
