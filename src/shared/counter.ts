import { map, scan } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';

export default function counter(
  increment: Observable<{}>,
  decrement: Observable<{}>,
  startValue = 0
): Observable<number> {
  return merge(
    increment.pipe(map(() => 1)),
    decrement.pipe(map(() => -1))
  ).pipe(scan((acc, i) => acc + i, startValue));
}
