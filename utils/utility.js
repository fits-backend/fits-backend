const isObjectEmpty = (obj) => {
  console.log("object", obj);
  return Object.keys(obj).length === 0;
};

module.exports = {
  isObjectEmpty,
};
