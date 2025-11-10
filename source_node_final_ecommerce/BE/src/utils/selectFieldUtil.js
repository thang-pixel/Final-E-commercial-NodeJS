
const selectFieldUtil = (role) => {
  let fieldsToHide = '';
  if (role !== 'admin') {
    fieldsToHide += '-variants.original_price ';
  }
  return fieldsToHide;
}