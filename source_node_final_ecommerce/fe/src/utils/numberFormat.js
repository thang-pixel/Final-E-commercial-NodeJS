
const unFormatNumber = (val) => {
  if (!val) return "";
  return val.toString().replace(/\D+/g, "");;
};


const formatNumber = (val) => {
  if (!val) return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

console.log(formatNumber('12345www6')); // 123.456
console.log(unFormatNumber('123.456'));   // 123456

module.exports = {
  formatNumber,
  unFormatNumber,
};