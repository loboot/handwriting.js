const Promise = require('../promise-a-plus-es');

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
