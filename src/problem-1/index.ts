import { map, scan } from 'rxjs/operators';
import onReady from '../shared';
import render from './render';
import { merge } from 'rxjs';

export default function problem1(): HTMLElement {
  const [view, increment, decrement, inputChange, showValue] = render();

  inputChange.subscribe((v) => showValue(v));

  merge(increment.pipe(map(() => 1)), decrement.pipe(map(() => -1)))
    .pipe(
      scan((acc, i) => (acc = acc + i), 0),
      map((numberOfClicks) => `${numberOfClicks}`)
    )
    .subscribe((v) => {
      showValue(v);
    });

  return view;
}

onReady(problem1);
