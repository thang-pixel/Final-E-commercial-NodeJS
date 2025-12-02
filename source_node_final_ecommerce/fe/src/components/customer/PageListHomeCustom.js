import './CategoryCustomer.css';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const PageListHomeCustom = ({ pages = [], className, styles }) => {
  return (
    <ul
      className={`flex flex-col gap-2 min-w-full ${className ? className : ''}`}
      style={styles}
    >
      {pages.map((page, index) => (
        <li
          key={index}
          className="menuCategoryItem
            group  rounded-e-md p-2  
            min-w-full  hover:bg-gray-100 cursor-pointer
            relative"
        >
          <Link to={`/${page.value}`} className="flex items-center">
            <div className="flex items-center w-full px-1 gap-2">
              <Typography className="whitespace-nowrap">{page.label}</Typography>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default PageListHomeCustom;
