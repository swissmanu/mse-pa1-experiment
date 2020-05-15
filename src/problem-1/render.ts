import { html, list, RedomComponent, setAttr, setChildren, text } from 'redom';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

type RenderResult = [HTMLElement, Events, Update];
type Events = {
  increment: Observable<Event>;
  decrement: Observable<Event>;
  input: Observable<string>;
  reset: Observable<Event>;
};
type Update = {
  logValue: (value: string) => void;
  setButtonsEnabled: (enabled: boolean) => void;
};

class LogItem implements RedomComponent {
  public el: HTMLElement;

  constructor() {
    this.el = html('li', { 'data-testid': 'logEntry' });
  }

  update(data: string): void {
    setChildren(this.el, [html('code', data)]);
  }
}

export default function render(): RenderResult {
  let loggedValues: string[] = [];
  const logDisplay = list(html('ul', { 'data-testid': 'log' }), LogItem);

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
  const resetButtonClicks = fromEvent(resetButton, 'click').pipe(
    tap(() => {
      loggedValues = [];
      logDisplay.update(loggedValues);
    })
  );

  const logValue = (v: string): void => {
    loggedValues = [v, ...loggedValues];
    logDisplay.update(loggedValues);
  };
  const setButtonsEnabled = (enabled: boolean): void => {
    setAttr(incrementButton, { disabled: !enabled });
    setAttr(decrementButton, { disabled: !enabled });
  };

  return [
    html('main', [
      html(
        'section',
        html('fieldset', [
          html('legend', {
            textContent: 'Counter: Count up and down using buttons',
          }),
          incrementButton,
          text(' '),
          decrementButton,
        ])
      ),
      html(
        'section',
        html('fieldset', [
          html('legend', { textContent: 'Manual Input: Show entered text' }),
          [input],
        ])
      ),
      html(
        'section',
        html('fieldset', [
          html('legend', { textContent: 'Output Log' }),
          html(
            'div',
            { style: { 'max-height': '160px', 'overflow-y': 'scroll' } },
            logDisplay
          ),
        ])
      ),
      html('section', resetButton),
    ]),
    {
      increment: incrementButtonClicks,
      decrement: decrementButtonClicks,
      input: inputChanges,
      reset: resetButtonClicks,
    },
    {
      logValue,
      setButtonsEnabled,
    },
  ];
}
