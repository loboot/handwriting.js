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
   * 实例方法-then方法
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
   * 实例方法-注册一个promise被拒绝时的函数 Promise.prototype.then(undefined,onRejected)
   * @param {Function} onRejected
   * @returns {Promise}  返回一个promise
   */

  Promise.prototype.catch = function (onRejected) {
    return Promise.prototype.then.call(this, undefined, onRejected);
  };

  /**
   * 静态方法-给定值转为promise。
   * @param {any} value value为thenable对象，调用then。
   * @returns {Promise} 返回指定结果的Promise
   */
  Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resolve, reject);
      } else {
        resolve(value);
      }
    });
  };

  /**
   * 静态方法-返回拒绝的Promise
   * @param {any} reason
   * @returns {Promise}
   */
  Promise.reject = function (reason) {
    return new Promise((undefined, reject) => {
      reject(reason);
    });
  };

  /**
   * 静态方法-接收promise可迭代对象，返回最快被处理(resolve\reject)的promise
   * @param {Array<Promise>} arr
   * @returns {Promise}
   */
  Promise.race = function (arr) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < arr.length; i++) {
        Promise.resolve(arr[i]).then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          }
        );
      }
    });
  };

  /**
   * 静态方法-返回任意时刻被resolve的Promise
   * @param {Array<Promise>} arr
   * @returns {Promise}
   */

  Promise.any = function (arr) {
    return new Promise((resolve, reject) => {
      if (!arr.length) {
        reject();
      }
      let errorCount = 0;
      for (let i = 0; i < arr.length; i++) {
        const p = Promise.resolve(arr[i]).then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            errorCount++;
            if (errorCount === arr.length) reject('AggregateError: All promises were rejected');
          }
        );
      }
    });
  };

  /**
   * 静态方法-返回全部被兑现的Promise数组
   * @param {Array<Promise>} arr
   * @returns {Array<Promise>}
   */

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      const promises = [];
      for (let i = 0; i < arr.length; i++) {
        Promise.resolve(arr[i]).then(
          (value) => {
            if (!(arr[i] instanceof Promise)) {
              promises.push(arr[i]);
            } else {
              promises.push(Promise.resolve(arr[i]));
            }
            if (i === arr.length - 1) resolve(promises);
          },
          (reason) => {
            return reject(Promise.reject(reason));
          }
        );
      }
    });
  };

  Promise.allSettled = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr.length) resolve([]);
      const promises = [];
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i] instanceof Promise) {
          promises.push(arr[i]);
        } else {
          Promise.resolve(arr[i]).then(
            (value) => {
              promises.push(Promise.resolve(arr[i]));
              if (i === arr.length - 1) resolve(promises);
            },
            (reason) => {
              promises.push(Promise.reject(arr[i]));
              if (i === arr.length - 1) resolve(promises);
            }
          );
        }
      }
    });
  };

  window.Promise = Promise;
})(globalThis);

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
