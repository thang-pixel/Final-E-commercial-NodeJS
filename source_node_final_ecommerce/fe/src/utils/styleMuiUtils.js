const createBoxRoundedShadow = (backgroundColor, border, borderRadius, boxShadow, padding) => {
  return {
    backgroundColor: backgroundColor || 'white',
    border: border || '1px solid var(--border-color)',
    borderRadius: borderRadius || 2,
    boxShadow: boxShadow || 'var(--box-shadow)',
    p: padding || 2,
  };
};


const styleMuiUtils = {
  createBoxRoundedShadow,
};

export default styleMuiUtils;