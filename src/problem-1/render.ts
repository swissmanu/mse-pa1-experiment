import { html, setAttr } from 'redom';
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
  const incrementButton = html('button', { textContent: 'Increment' });
  const incrementButtonClicks = fromEvent(incrementButton, 'click');
  incrementButton.setAttribute('data-testid', 'increment');

  const decrementButton = html('button', { textContent: 'Decrement' });
  const decrementButtonClicks = fromEvent(decrementButton, 'click');
  decrementButton.setAttribute('data-testid', 'decrement');

  const input = html('input', { type: 'text' });
  const inputChanges = merge(
    fromEvent(input, 'keyup'),
    fromEvent(input, 'change')
  );
  input.setAttribute('data-testid', 'input');

  const display = html('span', { textContent: 'Ready' });
  display.setAttribute('data-testid', 'display');

  return [
    html('main', [
      html('fieldset', [
        html('legend', { textContent: 'Actions' }),
        incrementButton,
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
    inputChanges.pipe(map((e) => (e.target as HTMLInputElement).value)),
    (v): void => setAttr(display, 'textContent', v),
  ];
}
