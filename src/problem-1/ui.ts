import { html, setAttr, text } from 'redom';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

type UI = [HTMLElement, Events, Update];
export type Events = {
  increment: Observable<Event>;
  decrement: Observable<Event>;
  input: Observable<string>;
  reset: Observable<Event>;
};
export type Update = {
  showValue: (value: string) => void;
  setButtonsEnabled: (enabled: boolean) => void;
  setInput: (value: string) => void;
};

export default function createUI(): UI {
  const valueDisplay = html('div', {
    textContent: 'Ready',
    'data-testid': 'value',
  });

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
  const inputChanges = fromEvent(input, 'keyup').pipe(
    debounceTime(300),
    map((e) => (e.target as HTMLInputElement).value)
  );

  const resetButton = html('button', {
    textContent: 'Reset',
    'data-testid': 'reset',
  });
  const resetButtonClicks = fromEvent(resetButton, 'click');

  const showValue = (v: string): void => {
    setAttr(valueDisplay, 'textContent', v);
  };
  const setButtonsEnabled = (enabled: boolean): void => {
    setAttr(incrementButton, { disabled: !enabled });
    setAttr(decrementButton, { disabled: !enabled });
  };
  const setInput = (value: string): void => {
    setAttr(input, 'value', value);
  };

  return [
    html('main', [
      html(
        'p',
        text(
          'Count up and down using the buttons, show the entered text from the input field and reset using the reset button. Check the tests. Everything looking good?'
        )
      ),
      html(
        'section',
        html('fieldset', [
          html('legend', {
            textContent: 'Counter',
          }),
          decrementButton,
          text(' '),
          incrementButton,
        ])
      ),
      html(
        'section',
        html('fieldset', [
          html('legend', { textContent: 'Manual Input' }),
          [input],
        ])
      ),
      html('section', resetButton),
      html(
        'section',
        html('fieldset', [
          html('legend', { textContent: 'Output Log' }),
          valueDisplay,
        ])
      ),
    ]),
    {
      increment: incrementButtonClicks,
      decrement: decrementButtonClicks,
      input: inputChanges,
      reset: resetButtonClicks,
    },
    {
      showValue,
      setInput,
      setButtonsEnabled,
    },
  ];
}
