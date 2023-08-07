// const foo = {
//   fn() {
//     setTimeout(() => {
//       console.log(this);
//     });
//   },
// };

// foo.fn();

function foo(a) {
  this.a = a;
}

const obj1 = {};
const bar = foo.bind(obj1);
bar(2);
console.log(obj1.a);
console.log(bar);

const baz = new bar(1);
console.log(obj1.a);
console.log(baz);

var a = 123;
const foz = () => (a) => {
  console.log(this.a);
};

const obj11 = {
  a: 2,
};

const obj22 = {
  a: 3,
};

const bz = foz.call(obj11);
console.log(bz.call(obj22));
