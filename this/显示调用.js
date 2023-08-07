const foo = {
  name: 'Lucas',
  logName() {
    console.log(this.name);
  },
};

const bar = {
  name: 'mike',
};

foo.logName.call(bar); //mike
