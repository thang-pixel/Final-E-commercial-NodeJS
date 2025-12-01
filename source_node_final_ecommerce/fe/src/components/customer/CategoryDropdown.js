import CategoryListHomeCustom from "./CategoryListHomeCustom";

// ...existing code...
const CategoryDropdown = ({ categories, isOpenCateMenu }) => {
  const panelClass = `
    menuCategoryList
    bg-white mt-1 rounded-md shadow-lg border border-gray-200
    transition-all duration-200 ease-in-out
    absolute left-0 top-full
    max-h-[70vh]  
    z-30
    ${isOpenCateMenu ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}
  `;

  return (
    <CategoryListHomeCustom
      categories={categories}
      className={panelClass}
      styles={{}}
    />
  );
};

export default CategoryDropdown;
// ...existing code...