const buildSku = (productId, attrs) => {
  const attrStr = (attrs || [])
    .map((a) => `${a.code.substring(0, 3).toUpperCase()}${a.value}`)
    .join('-');
  // Có thể slugify / toUpperCase nếu muốn
  return `P${productId}-${attrStr}`;
};
module.exports = {
  buildSku,
};