

// lay danh sach thuoc tinh san pham tu variant [ {code, values: []}, ...]
const getAttributesFromVariants = (variants) => {
  const attrs = [];
  if (!Array.isArray(variants) || variants.length === 0) return attrs;

  // gather all attribute keys
  const attrKeys = new Set();
  const values = new Map(); // item.code = Set of values

  // []
  variants.forEach((variant) => {
    const variantAttrs = variant.attributes || {};

    // [{ code: '...}, value: '...' }, ...]
    const entries = Object.values(variantAttrs);
    console.log('variantAttrs entries', entries);
    entries.forEach(({ code, value }) => {
      attrKeys.add(code);
      if (!values.has(code)) {
        values.set(code, new Set());
      }
      values.get(code).add(value);
    });
  });

  // build attrs array
  attrKeys.forEach((code) => {
    attrs.push({
      code,
      values: Array.from(values.get(code) || []).sort((a, b) => {
        // try sort number first
        const na = parseFloat(a);
        const nb = parseFloat(b);
        if (!isNaN(na) && !isNaN(nb)) {
          return na - nb;
        }
        return a.localeCompare(b);
      }),
    });
  });

  console.log('getAttributesFromVariants', attrs);
  return attrs;
};

// chon mot value, tim duoc variant tuong ung theo code + value
const findVariantByAttributes = (variants, code, value) => {
  let foundVariant = null;
  // let foundIdx = -1;

  variants.forEach((item, idx) => {
    const attrs = item.attributes || {};
    const entries = Object.values(attrs);

    let match = false;
    entries.forEach((item) => {
      if (item.code === code && item.value === value) {
        match = true;
        return;
      }
    });
    if (match) {
      foundVariant = item;
      // foundIdx = idx;
    }
  });

  return foundVariant;
};

const productUtil = {
  getAttributesFromVariants,
  findVariantByAttributes
};

export default productUtil;