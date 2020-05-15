import { fireEvent, queries, waitFor } from '@testing-library/dom';
import problem1 from '.';

const inputValue = 'hey there!';

async function expectLogEntries(
  log: HTMLElement,
  expectedEntries: string[]
): Promise<void> {
  await waitFor(() =>
    expect(() => queries.getAllByTestId(log, 'logEntry')).not.toThrow()
  );

  expect(
    queries
      .getAllByTestId(log, 'logEntry')
      .map(({ textContent }) => textContent)
  ).toEqual(expectedEntries);
}

describe('Problem 1', () => {
  let incrementButton: HTMLButtonElement;
  let decrementButton: HTMLButtonElement;
  let input: HTMLInputElement;
  let resetButton: HTMLButtonElement;
  let log: HTMLElement;

  beforeEach(async () => {
    const app = problem1();

    incrementButton = (await queries.findByTestId(
      app,
      'increment'
    )) as HTMLButtonElement;
    decrementButton = (await queries.findByTestId(
      app,
      'decrement'
    )) as HTMLButtonElement;
    input = (await queries.findByTestId(app, 'input')) as HTMLInputElement;
    resetButton = (await queries.findByTestId(
      app,
      'reset'
    )) as HTMLButtonElement;
    log = await queries.findByTestId(app, 'log');
  });

  test('shows no logged values at start', () => {
    expect(log.childNodes.length).toBe(0);
  });

  describe('Counter', () => {
    test('increment button should log a incremented', async () => {
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent(incrementButton, new MouseEvent('dblclick', { button: 0 }));

      await expectLogEntries(log, ['2', '1']);
    });

    test('decrement button should log a decremented value', async () => {
      fireEvent.click(decrementButton);
      fireEvent.click(decrementButton);
      fireEvent(decrementButton, new MouseEvent('dblclick', { button: 0 }));

      const logEntries = queries
        .getAllByTestId(log, 'logEntry')
        .map(({ textContent }) => textContent);
      expect(logEntries).toEqual(['-2', '-1']);
    });

    test('increment and decrement button can be used simultaneously', async () => {
      fireEvent.click(decrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(decrementButton);

      await expectLogEntries(log, ['0', '1', '0', '-1']);
    });
  });

  describe('Manual Input', () => {
    test('input field value is logged', async () => {
      input.value = inputValue;
      fireEvent.keyUp(input);

      await expectLogEntries(log, [inputValue]);
    });

    test('changing the input field disables the counter buttons', async () => {
      input.value = inputValue;
      fireEvent.keyUp(input);

      await expectLogEntries(log, [inputValue]);
      expect(incrementButton.disabled).toBe(true);
      expect(decrementButton.disabled).toBe(true);
    });
  });

  describe('Reset', () => {
    test('reverts the counter so it works again as after the first usage', async () => {
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(decrementButton);
      await expectLogEntries(log, ['1', '2', '1']);

      fireEvent.click(resetButton);
      expect(incrementButton.disabled).toBe(false);
      expect(decrementButton.disabled).toBe(false);

      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(decrementButton);
      fireEvent.click(decrementButton);
      await expectLogEntries(log, ['0', '1', '2', '1']);
    });

    test('reverts the manual input so it works again as after the first usage', async () => {
      input.value = inputValue;
      fireEvent.keyUp(input);
      await expectLogEntries(log, [inputValue]);

      fireEvent.click(resetButton);
      expect(incrementButton.disabled).toBe(false);
      expect(decrementButton.disabled).toBe(false);
      expect(input.value).toEqual('');

      input.value = inputValue;
      fireEvent.keyUp(input);
      await expectLogEntries(log, [inputValue]);
    });
  });
});
