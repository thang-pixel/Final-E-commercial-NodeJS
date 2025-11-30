import CategoryListHomeCustom from "./CategoryListHomeCustom";

const CategoryDropdown = ({ categories, isOpenCateMenu }) => {
  const thisClassname = `menuCategoryList  bg-white mt-1 transition-all duration-300 rounded-md ease-in-out ${
        isOpenCateMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`
  return (
    <CategoryListHomeCustom categories={categories} className={thisClassname} />
  );
};

export default CategoryDropdown;