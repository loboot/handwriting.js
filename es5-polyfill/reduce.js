// Array.prototype.reduce = Array.prototype.reduce || function (callback /* , initialValue*/) {
//   if (this === null) throw new TypeError('Array.prototype.reduce called on null or undefined');

//   if (typeof callback !== 'function') throw TypeError('callback must be a function');

//   const self = Object(this);
//   const length = self.length;

//   const argumentsLength = arguments.length;

//   let index = 0;
//   let memo;
//   if (argumentsLength < 2) {
//     while (true) {
//       if (index in self) {
//         memo = self[index];
//         index += 1;
//         break;
//       }
//       index += 1;

//       if (length <= index) {
//         throw new TypeError('Reduce of empty array with no initial value');
//       }
//       memo = arguments[index];
//     }
//   }

//   for (; length > index; index++)
//     if (index in self) {
//       memo = callback(memo, self[index], index);
//     }

//   return memo;
// };

Array.prototype.reduce =
  // Array.prototype.reduce ||
  function (cb /** ,initialValue */) {
    if (this === null) throw new TypeError('Array.prototype.reduce called on null or undefined');

    if (typeof cb !== 'function') throw TypeError('callback must be a function');
    const arr = Object(this);
    let memo = arguments.length < 2 ? arr[0] : arguments[1];

    for (let index = arguments.length < 2 ? 1 : 0; index < arr.length; index++) {
      memo = cb(memo, arr[index], index, arr);
    }
    return memo;
  };

Array.prototype.reduce.call([1, 2, 3, 4, 5], (prev, cur) => {
  console.log(prev);
  return (prev += cur);
});
