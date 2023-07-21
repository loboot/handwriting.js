/**
 *  Promise/A+ 规范
 *  ES6实现
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    reject(new TypeError('changing promise'));
  }
  if ((x && typeof x === 'object') || typeof x === 'function') {
    let called;
    try {
      const { then } = x;

      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        if (called) return;
        called = true;
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

class Promise {
  // executor接收两个参数 resolve 和 reject 回调函数
  constructor(executor) {
    this.status = PENDING;
    this.onFulfilled = []; // 成功的回调
    this.onRejected = []; // 失败的回调

    const self = this;

    function resolve(value) {
      if (self.status === PENDING) {
        self.status = FULFILLED;
        self.value = value;

        self.onFulfilled.forEach((fn) => fn());
      }
    }

    function reject(reason) {
      if (self.status === PENDING) {
        self.status = REJECTED;
        self.reason = reason;

        self.onRejected.forEach((fn) => fn());
      }
    }

    // new 之后 立刻执行 executor，异常则reject
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // then方法 返回一个promise
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const self = this;

    const promise2 = new Promise((resolve, reject) => {
      if (self.status === FULFILLED) {
        process.nextTick(() => {
          try {
            const x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else if (self.status === REJECTED) {
        process.nextTick(() => {
          try {
            const x = onRejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else if (self.status === PENDING) {
        self.onFulfilled.push(() => {
          process.nextTick(() => {
            try {
              const x = onFulfilled(self.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });

        self.onRejected.push(() => {
          process.nextTick(() => {
            try {
              const x = onRejected(self.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

Promise.deferred = function () {
  const result = {};
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
};

module.exports = Promise;
