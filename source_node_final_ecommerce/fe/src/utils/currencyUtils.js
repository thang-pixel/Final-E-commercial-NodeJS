
// Helper format số tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    value || 0
  );

const currencyUtils = {
  formatCurrency,
}

export default currencyUtils;