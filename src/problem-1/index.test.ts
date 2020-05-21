import { fireEvent, queries, waitFor } from '@testing-library/dom';
import { marbles } from 'rxjs-marbles/jest';
import problem1, { createEngine } from '.';
import { Events, Update } from './ui';

describe('Problem 1', () => {
  describe('Integration Test', () => {
    const inputValue = 'hey there!';
    let incrementButton: HTMLButtonElement;
    let decrementButton: HTMLButtonElement;
    let input: HTMLInputElement;
    let resetButton: HTMLButtonElement;
    let value: HTMLElement;

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
      value = await queries.findByTestId(app, 'value');
    });

    test('shows "Ready" at start', () => {
      expect(value.textContent).toEqual('Ready');
    });

    describe('Counter', () => {
      test('increment button should log a incremented', async () => {
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('1');
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('2');
        fireEvent(incrementButton, new MouseEvent('dblclick', { button: 0 }));
        expect(value.textContent).toEqual('2');
      });

      test('decrement button should log a decremented value', async () => {
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('-1');
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('-2');
        fireEvent(decrementButton, new MouseEvent('dblclick', { button: 0 }));
        expect(value.textContent).toEqual('-2');
      });

      test('increment and decrement button can be used simultaneously', async () => {
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('-1');
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('0');
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('1');
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('0');
      });
    });

    describe('Manual Input', () => {
      test('input field value is logged', async () => {
        input.value = inputValue;
        fireEvent.keyUp(input);
        await waitFor(() => expect(value.textContent).toEqual(inputValue));
      });

      test('changing the input field disables the counter buttons', async () => {
        input.value = inputValue;
        fireEvent.keyUp(input);

        await waitFor(() => expect(value.textContent).toEqual(inputValue));
        await waitFor(() => expect(incrementButton.disabled).toBe(true));
        await waitFor(() => expect(decrementButton.disabled).toBe(true));
      });
    });

    describe('Reset', () => {
      test('reverts the counter so it works again as after the first usage', async () => {
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('1');
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('2');
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('1');

        fireEvent.click(resetButton);
        expect(incrementButton.disabled).toBe(false);
        expect(decrementButton.disabled).toBe(false);

        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('1');
        fireEvent.click(incrementButton);
        expect(value.textContent).toEqual('2');
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('1');
        fireEvent.click(decrementButton);
        expect(value.textContent).toEqual('0');
      });

      test('reverts the manual input so it works again as after the first usage', async () => {
        input.value = inputValue;
        fireEvent.keyUp(input);
        await waitFor(() => expect(value.textContent).toEqual(inputValue));

        fireEvent.click(resetButton);
        expect(incrementButton.disabled).toBe(false);
        expect(decrementButton.disabled).toBe(false);
        expect(input.value).toEqual('');

        input.value = inputValue;
        fireEvent.keyUp(input);
        await waitFor(() => expect(value.textContent).toEqual(inputValue));
      });
    });
  });

  describe('Engine', () => {
    let update: Update;

    beforeEach(() => {
      update = {
        setButtonsEnabled: jest.fn(),
        setInput: jest.fn(),
        showValue: jest.fn(),
      };
    });

    test(
      'can count up and down',
      marbles((m) => {
        const events: Events = {
          decrement: m.hot('                             --d---d---d----'),
          increment: m.hot('                             i---i---i---i-i'),
          input: m.hot('                                                '),
          reset: m.hot('                                                '),
        };
        m.expect(createEngine(events, update)).toBeObservable(
          '1-0-1-0-1-0-1-2'
        );

        m.flush();
        expect(update.setButtonsEnabled).not.toHaveBeenCalled();
        expect(update.setInput).not.toHaveBeenCalled();
      })
    );

    test(
      'can reset the counter',
      marbles((m) => {
        const events: Events = {
          decrement: m.hot('                             --d---------d'),
          increment: m.hot('                             i---i---i-i--'),
          input: m.hot('                                              '),
          reset: m.hot('                                 ------r------'),
        };
        m.expect(createEngine(events, update)).toBeObservable('1-0-1---1-2-1');

        m.flush();
        expect(update.setButtonsEnabled).toHaveBeenCalledTimes(1);
        expect(update.setButtonsEnabled).toHaveBeenCalledWith(true);
        expect(update.showValue).toHaveBeenCalledTimes(1);
        expect(update.showValue).toHaveBeenCalledWith('');
        expect(update.setInput).toHaveBeenCalledTimes(1);
        expect(update.setInput).toHaveBeenCalledWith('');
      })
    );

    test(
      'can use input',
      marbles((m) => {
        const events: Events = {
          decrement: m.hot('                                         '),
          increment: m.hot('                                        '),
          input: m.hot('                                 a-b-c-d-e-f'),
          reset: m.hot('                                            '),
        };
        m.expect(createEngine(events, update)).toBeObservable('a-b-c-d-e-f');

        m.flush();
        expect(update.setButtonsEnabled).toHaveBeenCalledTimes(6);
        expect(update.setButtonsEnabled).toHaveBeenLastCalledWith(false);
        expect(update.showValue).not.toHaveBeenCalled();
        expect(update.setInput).not.toHaveBeenCalled();
      })
    );

    test(
      'can use input after resetting',
      marbles((m) => {
        const events: Events = {
          decrement: m.hot('                                         '),
          increment: m.hot('                                        '),
          input: m.hot('                                 a-b-c---e-f'),
          reset: m.hot('                                 ------r----'),
        };
        m.expect(createEngine(events, update)).toBeObservable('a-b-c---e-f');

        m.flush();
        expect(update.setButtonsEnabled).toHaveBeenCalledTimes(6);
        expect(update.setButtonsEnabled).toHaveBeenNthCalledWith(4, true);
        expect(update.setButtonsEnabled).toHaveBeenLastCalledWith(false);
        expect(update.showValue).toHaveBeenCalledTimes(1);
        expect(update.showValue).toHaveBeenCalledWith('');
        expect(update.setInput).toHaveBeenCalledTimes(1);
        expect(update.setInput).toHaveBeenCalledWith('');
      })
    );

    test(
      'can use counter and input',
      marbles((m) => {
        const events: Events = {
          decrement: m.hot('                             --d-----------d'),
          increment: m.hot('                             i-----------i--'),
          input: m.hot('                                 ----a---b------'),
          reset: m.hot('                                 ------r---r----'),
        };
        m.expect(createEngine(events, update)).toBeObservable(
          '1-0-a---b---1-0'
        );

        m.flush();
        expect(update.setButtonsEnabled).toHaveBeenCalledTimes(4);
        expect(update.setButtonsEnabled).toHaveBeenNthCalledWith(2, true);
        expect(update.setButtonsEnabled).toHaveBeenNthCalledWith(3, false);
        expect(update.setButtonsEnabled).toHaveBeenLastCalledWith(true);
        expect(update.showValue).toHaveBeenCalledTimes(2);
        expect(update.showValue).toHaveBeenCalledWith('');
        expect(update.setInput).toHaveBeenCalledTimes(2);
        expect(update.setInput).toHaveBeenCalledWith('');
      })
    );
  });
});
