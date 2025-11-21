// src/services/productSearch.service.js
const es = require('../lib/elasticSearchClient');

async function indexProduct(product) {
  await es.index({
    index: 'products',
    id: String(product._id),
    document: {
      id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      status: product.status,
    },
  });
}

async function removeProduct(productId) {
  await es.delete({
    index: 'products',
    id: String(productId),
  }).catch(() => {});
}

module.exports = { indexProduct, removeProduct };
