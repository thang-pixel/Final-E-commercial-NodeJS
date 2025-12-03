
const unFormatNumber = (val) => {
  if (!val) return "";
  return val.toString().replace(/\D+/g, "");;
};


const formatNumber = (val) => {
  if (!val) return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
} 

module.exports = {
  formatNumber,
  unFormatNumber,
};