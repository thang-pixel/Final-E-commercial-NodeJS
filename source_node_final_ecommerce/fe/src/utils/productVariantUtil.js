
const buildSku = (productId, attributes) => {
  const clearSpaces = (str) => str.replace(/\s+/g, '');
  console.log(clearSpaces('  ab c  d ')); // "abcd"
  const attrPart = attributes
    .map((attr) => `${clearSpaces(attr.code).substring(0, 3).toUpperCase()}${clearSpaces(attr.value).substring(0, 3).toUpperCase()}`)
    .join('-');
  return `P${productId}-${attrPart}`;
}

module.exports = {
  buildSku,
};