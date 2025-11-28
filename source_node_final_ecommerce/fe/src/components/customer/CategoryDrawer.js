import { Close } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import SearchHome from './SearchHome';

const CategoryDrawer = ({ categories, isOpen, setIsOpen, ref }) => {
  return (
    <div
      ref={ref}
      className={
        (isOpen ? 'translate-x-0' : '-translate-x-full') +
        ` menu-drawer  h-screen min-w-full sm:min-w-72   bg-white fixed top-0 left-0 z-30 shadow-lg transform transition-transform duration-300 ease-in-out`
      }
    >
      <div className='searchProduct p-2'>
        <SearchHome />
      </div>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Danh mục sản phẩm</h2>
        <Close cursor="pointer" onClick={() => setIsOpen(false)} />
      </div>
      <div className="p-4">
        <ul>
          {categories && categories.length > 0 ? (
            categories.map((cate) => (
              <li
                key={cate._id}
                className="menuCategoryItem hover:bg-cyan-100  rounded-e-md p-2"
              >
                <Link to={`/products/category_id=${cate._id}`}>
                  <div className="flex items-center px-1 gap-2">
                    <img
                      src={cate.image_url || '/category-default.png'}
                      alt={cate.name}
                      className="h-6 w-6 flex-shrink-0 mr-2 object-contain"
                    />
                    <Typography className="whitespace-nowrap">
                      {cate.name}
                    </Typography>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <Typography>Không có danh mục nào</Typography>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CategoryDrawer;
