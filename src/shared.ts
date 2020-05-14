import { mount } from 'redom';

export default function onReady(app: () => HTMLElement): void {
  let done = false;

  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete' && !done) {
      done = true;
      mount(document.body, app());
    }
  });
}
