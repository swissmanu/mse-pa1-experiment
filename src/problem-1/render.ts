import { html, text, setAttr } from 'redom';
import { Observable, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

type ButtonClicks = Observable<Event>;
type InputChanges = Observable<string>;
type ShowValueFn = (value: string) => void;
type RenderResult = [
  HTMLElement,
  ButtonClicks,
  ButtonClicks,
  InputChanges,
  ShowValueFn
];

export default function render(): RenderResult {
  const incrementButton = html('button', {
    textContent: 'Increment',
    'data-testid': 'increment',
  });
  const incrementButtonClicks = fromEvent(incrementButton, 'click');

  const decrementButton = html('button', {
    textContent: 'Decrement',
    'data-testid': 'decrement',
  });
  const decrementButtonClicks = fromEvent(decrementButton, 'click');

  const input = html('input', { type: 'text', 'data-testid': 'input' });
  const inputChanges = merge(
    fromEvent(input, 'keyup'),
    fromEvent(input, 'change')
  ).pipe(map((e) => (e.target as HTMLInputElement).value));

  const display = html('span', {
    textContent: 'Ready',
    'data-testid': 'display',
  });

  return [
    html('main', [
      html('fieldset', [
        html('legend', { textContent: 'Actions' }),
        incrementButton,
        text(' '),
        decrementButton,
      ]),
      html('fieldset', [
        html('legend', { textContent: 'Manual Input' }),
        input,
      ]),
      html('fieldset', [
        html('legend', { textContent: 'Result Display' }),
        display,
      ]),
    ]),
    incrementButtonClicks,
    decrementButtonClicks,
    inputChanges,
    (v): void => setAttr(display, 'textContent', v),
  ];
}
