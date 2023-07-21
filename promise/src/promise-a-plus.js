// IIEF 将Promise暴露给宿主对象
(function (window) {
  const PENDING = 'pending';
  const REJECTED = 'rejected';
  const FULFILLED = 'fulfilled';

  /**
   * Promise 构造函数
   * @param {Function} executor 执行器
   */

  function Promise(executor) {
    const self = this;
    self.status = PENDING;
    self.onFulfilled = [];
    self.onRejected = [];

    self.value = null;
    self.reason = null;

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

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  /**
   * Promise 解决过程是一个抽象的操作，其需输入一个 Promise 和一个值，我们表示为 [[Resolve]](Promise, x)，如果 x 有 then 方法且看上 * 去像一个 Promise ，解决程序即尝试使 Promise 接受 x 的状态；否则其用 x 的值来执行 Promise 。
   * 这种 thenable 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 Promise/A+ 协议的 then 方法即可；这同时也使遵循
   * Promise/A+ 规范的实现可以与那些不太规范但可用的实现能良好共存。
   * @param {Promise} promise
   * @param {} x
   */
  function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) return reject(new TypeError('The promise and the return value are the same'));

    if ((x && typeof x === 'object') || typeof x === 'function') {
      try {
        const { then } = x;

        if (typeof then === 'function') {
          let called = false;
          try {
            then.call(
              x,
              (y) => {
                if (called) return;
                called = true;
                resolvePromise(promise, y, resolve, reject);
              },
              (r) => {
                if (called) return;
                called = true;
                reject(r);
              }
            );
          } catch (e) {
            if (called) return;
            called = true;
            reject(e);
          }
        } else {
          resolve(x);
        }
      } catch (e) {
        reject(e);
      }
    } else {
      resolve(x);
    }
  }

  /**
   * Promise实例then方法
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @returns {Promise}  返回一个promise
   */
  Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const self = this;

    const promise2 = new Promise((resolve, reject) => {
      if (self.status === PENDING) {
        self.onFulfilled.push(() =>
          process.nextTick(() => {
            try {
              const x = onFulfilled(self.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          })
        );

        self.onRejected.push(() =>
          process.nextTick(() => {
            try {
              const x = onRejected(self.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          })
        );
      } else if (self.status === FULFILLED) {
        process.nextTick(() => {
          try {
            const x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else {
        process.nextTick(() => {
          try {
            const x = onRejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    return promise2;
  };

  /**
   * 函数对象方法
   * @param {any} value
   * @returns {Promise} 返回指定结果的Promise
   */
  Promise.resolve = function (value) {};

  window.Promise = Promise;
})(globalThis);

const p1 = new Promise((resolve) => {
  resolve(1);
});

p1.then();

// test
Promise.deferred = function () {
  const result = {};
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
};

module.exports = Promise;
