// src/lib/initProductIndex.js
const es = require('./elasticSearchClient');

async function initProductIndex() {
  const index = 'products';

  const exists = await es.indices.exists({ index });
  if (!exists) {
    await es.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            description: { type: 'text' },
            category: { type: 'keyword' },
            price: { type: 'float' },
            status: { type: 'keyword' }
          }
        }
      }
    });
  }
}

module.exports = initProductIndex;
