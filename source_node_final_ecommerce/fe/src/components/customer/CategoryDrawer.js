import { Close } from '@mui/icons-material'; 
import SearchHome from './SearchHome';
import CategoryListHomeCustom from './CategoryListHomeCustom';

const CategoryDrawer = ({ categories, isOpen, setIsOpen, ref }) => {
  return (
    <div
      ref={ref}
      className={
        (isOpen ? 'translate-x-0' : '-translate-x-full') +
        ` menu-drawer  h-screen min-w-full sm:min-w-72   bg-white fixed top-0 left-0 z-30 shadow-lg transform transition-transform duration-300 ease-in-out`
      }
    >
      <div className="searchProduct p-2">
        <SearchHome />
      </div>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Danh mục sản phẩm</h2>
        <Close cursor="pointer" onClick={() => setIsOpen(false)} />
      </div>
      <div className="p-4">
        <CategoryListHomeCustom categories={categories}/>
      </div>
    </div>
  );
};

export default CategoryDrawer;
