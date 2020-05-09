export default function onReady(f: () => void): void {
  let done = false;

  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete' && !done) {
      done = true;
      f();
    }
  });
}
