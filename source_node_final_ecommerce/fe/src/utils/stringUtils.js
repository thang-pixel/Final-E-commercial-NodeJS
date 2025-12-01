const normalizeUrl = (path = '') => {
  // const base = (API_DOMAIN || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${p}`;
};

const isEmtyString = (str) => {
  return !str || str.trim().length === 0;
};

const stringUtils = {
  normalizeUrl,
  isEmtyString,
};

export default stringUtils;
