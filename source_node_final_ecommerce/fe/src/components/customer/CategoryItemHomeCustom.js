import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import CategoryListHomeCustom from './CategoryListHomeCustom';
import { useState } from 'react';

const CategoryItemHomeCustom = ({ cate }) => {
  const [isShow, setIsShow] = useState(false);

  const handleToggleSubmenuOnMobile = (e) => {
    // const submenu = e.currentTarget.querySelector('ul');
    // if (submenu) {
    //   // submenu.classList.toggle('hidden');
    // }
    setIsShow((prev) => !prev);
  };
  return (
    <li
      key={cate._id}
      className="menuCategoryItem
      group  rounded-e-md p-2  
      relative"
    >
      <Link to={`/products?category_slug=${cate.slug}`} className="flex items-center">
        <div className="flex items-center w-full px-1 gap-2">
          <img
            src={cate.image_url || '/category-default.png'}
            alt={cate.name}
            className="h-6 w-6 flex-shrink-0 mr-2 object-contain"
          />
          <Typography className="whitespace-nowrap">{cate.name}</Typography>
          {cate.children && cate.children.length > 0 && (
            <button
              className={`ml-auto sm:hidden p-1 rounded-md 
              hover:bg-cyan-200 transition-all duration-300
              ${isShow ? 'bg-cyan-100' : ''}`}
              onClick={handleToggleSubmenuOnMobile}
            >
              <span
                className={`block text-lg font-bold transition-transform duration-300 
                ${isShow ? 'rotate-90 text-cyan-600' : 'text-gray-700'}`}
              >
                +
              </span>
            </button>
          )}
        </div>
      </Link>

      {/* subitem */}
      {cate.children && cate.children.length > 0 && (
        <>
          <div className="bridge hidden group-hover:block w-2 bg-transparent absolute top-0 left-full h-full z-40"></div>
          <div className="hidden group-hover:block rounded-lg overflow-hidden z-50 absolute top-0 left-full ml-2 min-w-max">
            <CategoryListHomeCustom
              categories={cate.children}
              className={'bg-white'}
            />
          </div>
        </>
      )}

      {/* dropdown menu for mobile */}
      {/* dropdown */}
      {cate.children && cate.children.length > 0 && (
        <div
          className={`
          mt-0 sm:hidden 
          overflow-hidden transition-all duration-300 ease-in-out
          ${
            isShow
              ? 'max-h-96 opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-3'
          }
    `}
        >
          <CategoryListHomeCustom
            categories={cate.children}
            className={'bg-white'}
          />
        </div>
      )}
    </li>
  );
};

export default CategoryItemHomeCustom;
