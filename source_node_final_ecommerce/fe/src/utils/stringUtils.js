const normalizeUrl = (path = '') => {
  // const base = (API_DOMAIN || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${p}`;
};

const stringUtils = {
  normalizeUrl,
};

export default stringUtils;
