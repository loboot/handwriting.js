// function* gen() {
//   console.log('enter');
//   let a = yield 1;
//   let b = yield (function () {
//     return 2;
//   })();
//   return 3;
// }

// const g = gen();
// console.log(typeof g);
// console.log(g.next());
// console.log(g.next());
// console.log(g.next());
// console.log(g.next());
const readFileThunk = (filename) => {
  return (cb) => {
    setTimeout(() => {
      console.log(filename);
      cb();
    }, 1000);
  };
};

const gen = function* () {
  const data1 = yield readFileThunk('1.txt');
  console.log(data1.toString());
  const data2 = yield readFileThunk('2.txt');
  console.log(data2.toString());
};

const g = gen();
g.next().value((err, data) => {
  g.next(data).value((err, data) => {
    g.next(data);
  });
});
