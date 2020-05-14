import { fireEvent, queries } from '@testing-library/dom';
import problem1 from '.';

describe('Problem 1', () => {
  let incrementButton: HTMLElement;
  let decrementButton: HTMLElement;
  let input: HTMLInputElement;
  let valueDisplay: HTMLElement;

  beforeEach(async () => {
    const app = problem1();

    incrementButton = await queries.findByTestId(app, 'increment');
    decrementButton = await queries.findByTestId(app, 'decrement');
    input = (await queries.findByTestId(app, 'input')) as HTMLInputElement;
    valueDisplay = await queries.findByTestId(app, 'display');
  });

  test('shows "Ready" at start', () => {
    expect(valueDisplay.textContent).toEqual('Ready');
  });

  describe('actions', () => {
    test('increment button should increment shown value', async () => {
      fireEvent.click(incrementButton);
      expect(valueDisplay.textContent).toEqual('1');

      fireEvent.click(incrementButton);
      expect(valueDisplay.textContent).toEqual('2');

      fireEvent(incrementButton, new MouseEvent('dblclick', { button: 0 }));
      expect(valueDisplay.textContent).toEqual('2');
    });

    test('decrement button should decrement shown value', async () => {
      fireEvent.click(decrementButton);
      expect(valueDisplay.textContent).toEqual('-1');

      fireEvent.click(decrementButton);
      expect(valueDisplay.textContent).toEqual('-2');

      fireEvent(decrementButton, new MouseEvent('dblclick', { button: 0 }));
      expect(valueDisplay.textContent).toEqual('-2');
    });

    test('increment and decrement button can be used simultaneously', async () => {
      fireEvent.click(decrementButton);
      expect(valueDisplay.textContent).toEqual('-1');

      fireEvent.click(incrementButton);
      expect(valueDisplay.textContent).toEqual('0');
      fireEvent.click(incrementButton);
      expect(valueDisplay.textContent).toEqual('1');

      fireEvent.click(decrementButton);
      expect(valueDisplay.textContent).toEqual('0');
    });
  });

  describe('Manual Input', () => {
    test('input field value is shown in display', async () => {
      const inputValue = 'hey there!';
      input.value = inputValue;
      fireEvent.change(input);
      expect(valueDisplay.textContent).toEqual(inputValue);
    });
  });
});
