# Bypassing Node's call stack limit with `async`/`await`

TL;DR With `async`/`await`, you can unroll your recursive functions onto the
Javascript event loop!

The following piece of code will die a terrible death:

```js
function sumOf1To(n) {
  if (n == 0) {
    return 0
  }

  return n + sumOf1To(n - 1)
}

console.log(sumOf1To(100000))
```

Output:
```
C:\Users\Daniel\Desktop\test>node sync.js
C:\Users\Daniel\Desktop\test\sync.js:2
function sumOf1To(n) {
                 ^

RangeError: Maximum call stack size exceeded
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:2:18)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)
    at sumOf1To (C:\Users\Daniel\Desktop\test\sync.js:7:14)

C:\Users\Daniel\Desktop\test>
```

This is because the computer's stack is limited. However, what if we could move
the function call stack to the heap? That is what `async`/`await` does.
In fact, if you look at how Babel transpiles `async`/`await` you will notice
that they store what were once local variables as properties of an (heap-allocated)
object.

So let's try:

```js

async function sumOf1To(n) {
  if (n == 0) {
    return 0
  }

  return n + await sumOf1To(n - 1)
}

sumOf1To(100000)
.then(sum => console.log(sum))
.catch((err) => console.log(err.stack))
```

Viola!

```
C:\Users\Daniel\Desktop\test>node async.js
(node:8644) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): RangeError: Maximum call stack size exceeded
(node:8644) DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
(node:8644) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): RangeError: Maximum call stack size exceeded
(node:8644) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 3): RangeError: Maximum call stack size exceeded
...
```

Ooops. Something went wrong here. It turns out that we were not bypassing the
stack, because up to the final `await` statement all the calls were still synchronous.

A little `await` no-op fixes it:

```js
async function sumOf1To(n) {
  if (n == 0) {
    return 0
  }

  await Promise.resolve(0) // no-op

  return n + await sumOf1To(n - 1)
}

sumOf1To(100000)
.then(sum => console.log(sum))
.catch((err) => console.log(err.stack))
```

Success!
```
C:\Users\Daniel\Desktop\test>node transpiled.js
5000050000

C:\Users\Daniel\Desktop\test>
```

## Conclusion

If you are a Javascript fan, a functional programming afficiando, a
lover of recursive functions, and annoyed that Javascript doesn't do tail-call
optimization (or don't know what that means) and don't mind a (fairly significant)
performance penalty, or using up a lot of memory on the heap,
consider using `async`/`await`!

-----------------

The above was tested with Node 7.7.4, with both native `async`/`await` and
Babel-transpiled code.

# Appendix (a look at how the no-op changes recursion semantics)

**The failure** (comments added):
```js
while (1) {
  switch (_context.prev = _context.next) {
    case 0:
      if (!(n == 0)) {
        _context.next = 2;
        break; // Immediately jumps to case 2
      }

      return _context.abrupt("return", 0);

    case 2:
      _context.t0 = n;
      _context.next = 5;
      return sumOf1To(n - 1); // Stack recursion!
```

**The success** (comments added)
```js
while (1) {
  switch (_context.prev = _context.next) {
    case 0:
      if (!(n == 0)) {
        _context.next = 2;
        break;
      }

      return _context.abrupt("return", 0);

    case 2:
      _context.next = 4;
      return _promise2.default.resolve(0); // Suspends function execution, pushes the context to the event loop

    case 4:
      // When this is executed again, it's called straight
      // from the event loop -- no more stack to worry about!
      _context.t0 = n;
      _context.next = 7;
      return sumOf1To(n - 1);
  ```
