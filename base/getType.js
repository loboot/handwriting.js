function getType(obj) {
  let type = typeof obj;
  if (type !== 'object') return type;

  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}

console.log(getType([]));
console.log(getType(1));
console.log(getType('123'));
console.log(getType(null));
console.log(getType({}));
console.log(getType(String));
