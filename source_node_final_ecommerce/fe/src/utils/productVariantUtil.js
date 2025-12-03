
const buildSku = (productId, attributes) => {
  const clearSpaces = (str) => str.replace(/\s+/g, '');
  
  const attrPart = attributes
    .map((attr) => {
      const code = clearSpaces(attr.code).substring(0, 3).toUpperCase();
      const value = clearSpaces(attr.value).toUpperCase();
      return `${code}${value}`;
    })
    .join('-');
  return `P${productId}-${attrPart}`;
}

const isOutOfStock = (variant) => {
  return variant.stock <= 0;
}

module.exports = {
  buildSku,
  isOutOfStock,
};