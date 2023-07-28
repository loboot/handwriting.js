const Promise = require('../src/promise-a-plus');

const fetchData = (id = 1) => {
  const p1 = new Promise((resolve, reject) => {
    const request = require('request');
    request.get(`https://jsonplaceholder.typicode.com/posts/${id}`, (error, response, body) => {
      if (response.statusCode === 200) resolve(body);
      else {
        reject('error');
      }
    });
  });
  return p1;
};

test('promise then: the id is 1', () => {
  return fetchData().then(
    (json) => {
      const data = JSON.parse(json);
      expect(data.id).toBe(1);
    },
    (reject) => {
      expect(reject).toBe('error');
    }
  );
});

test('promise then: the id is 2', () => {
  return fetchData(2).then(
    (json) => {
      const data = JSON.parse(json);
      expect(data.id).toBe(2);
    },
    (reject) => {
      expect(reject).toBe('error');
    }
  );
});

test('promise then: output 1 3 2 in order', () => {
  return fetchData()
    .then(
      (json) => {
        const data = JSON.parse(json);
        expect(data.id).toBe(1);
        return fetchData(3);
      },
      (reject) => {
        expect(reject).toBe('error');
        return fetchData(3);
      }
    )
    .then(
      (json) => {
        const data = JSON.parse(json);
        expect(data.id).toBe(3);
      },
      (reject) => {
        expect(reject).toBe('error');
      }
    );
});

test('resolve number', () => {
  const p = Promise.resolve(123);
  return p.then((res) => {
    expect(res).toBe(123);
  });
});

test('resolve promise', () => {
  const original = Promise.resolve(33);
  const cast = Promise.resolve(original);
  return cast.then((value) => {
    expect(value).toBe(33);
  });
});

test('Promise.reject', () => {
  const p = Promise.reject('fail');
  return p.then(
    (res) => {
      expect(res).toBe(undefined);
    },
    (r) => {
      expect(r).toBe('fail');
    }
  );
});

test('Promise.race resolve promise', () => {
  const p1 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 1000);
  });
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 2000);
  });

  return Promise.race([p1, p2]).then((res) => {
    expect(res).toBe(1);
  });
});

test('Promise.race reject promise', () => {
  const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 1000);
  });
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 2000);
  });

  return Promise.race([p1, p2]).then(
    (res) => {
      expect(res).toBe(undefined);
    },
    (reason) => {
      expect(reason).toBe(1);
    }
  );
});

test('Promise.race non-promise', () => {
  return Promise.race([1, 3]).then((res) => {
    expect(res).toBe(1);
  });
});

test('Promise.any all fail', () => {
  const p1 = Promise.reject(1);
  const p2 = Promise.reject(2);
  return Promise.any([p1, p2]).then(
    (res) => {
      expect(res).toBe(undefined);
    },
    (reason) => {
      expect(reason).toEqual('AggregateError: All promises were rejected');
    }
  );
});

test('Promise.any one pass', () => {
  const p1 = Promise.reject(1);
  const p2 = Promise.resolve(2);
  return Promise.any([p1, p2]).then(
    (res) => {
      expect(res).toEqual(2);
    },
    (reason) => {
      expect(reason).toEqual('AggregateError: All promises were rejected');
    }
  );
});

test('Promise.any two pass', () => {
  const p1 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 2000);
  });
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
  return Promise.any([p1, p2]).then(
    (res) => {
      expect(res).toEqual(2);
    },
    (reason) => {
      expect(reason).toEqual('AggregateError: All promises were rejected');
    }
  );
});

test('Promise.all resolve', () => {
  return Promise.all([1, 2, 3, Promise.resolve(444)]).then(
    (value) => {
      expect(value).toEqual([1, 2, 3, Promise.resolve(444)]);
    },
    (reason) => {
      expect(reason).toBe(undefined);
    }
  );
});
test('Promise.all resolve non-promise', () => {
  return Promise.all([1, 2, 3, 444]).then(
    (value) => {
      expect(value).toEqual([1, 2, 3, 444]);
    },
    (reason) => {
      expect(reason).toBe(undefined);
    }
  );
});
test('Promise.all reject', () => {
  return Promise.all([
    1,
    2,
    3,
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(444);
      });
    }),
  ]).then(
    (value) => {},
    (reason) => {
      expect(reason).toEqual(Promise.reject(444));
    }
  );
});

test('Promise.prototype.catch', () => {
  return new Promise((resolve, reject) => {
    throw new Error('i will be catch');
  }).catch((reason) => {
    expect(reason).toEqual(new Error('i will be catch'));
  });
});

test('Promise.allSettled status', () => {
  const promise1 = Promise.resolve(3);
  const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, 'foo'));
  const promises = [promise1, promise2];

  return Promise.allSettled(promises).then((results) => {
    expect(results.map((item) => item.status)).toEqual(['fulfilled', 'rejected']);
  });
});

// test('Promise.allSettled value or reason', () => {
//   const promise1 = Promise.resolve(3);
//   const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, 'foo'));
//   const promises = [promise1, promise2];
//   return Promise.allSettled(promises).then((results) => {
//     expect(results.map((item) => item)).toEqual([Promise.resolve(3), Promise.reject('foo')]);
//   });
// });
