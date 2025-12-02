import { Close } from '@mui/icons-material';
import SearchHome from './SearchHome';
import CategoryListHomeCustom from './CategoryListHomeCustom';
import { useState } from 'react';
import PageListHomeCustom from './PageListHomeCustom';

const CategoryDrawer = ({ categories, isOpen, setIsOpen, ref }) => {
  const tabs = [
    {
      item: {
        label: 'Danh mục sản phẩm',
        value: 'categories',
        component: <CategoryListHomeCustom categories={categories} />,
      },
    },
    {
      item: {
        label: 'Danh sách trang',
        value: 'pages',
        component: (
          <PageListHomeCustom
            pages={[
              { label: 'Trang chủ', value: '' },
              { label: 'Sản phẩm', value: 'products' },
              { label: 'Giới thiệu', value: 'about' },
              { label: 'Liên hệ', value: 'contact' },
            ]}
          />
        ),
      },
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].value);

  

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
        <h2 className="text-lg font-semibold">
          {activeTab === 'categories' ? 'Danh mục sản phẩm' : 'Danh sách trang'}
        </h2>
        <Close cursor="pointer" onClick={() => setIsOpen(false)} />
      </div>
      <div className="p-4">
        {tabs && tabs.map((tab) => (
          <button
            key={tab.item.value

            }
            className={`mr-2 mb-4 px-3 py-1 rounded-full 
              ${
                activeTab === tab.item.value
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setActiveTab(tab.item.value)}
          >
            {tab.item.label}
          </button>
        ))}
        {tabs.find((tab) => tab.item.value === activeTab)?.item.component}
      </div>
    </div>
  );
};

export default CategoryDrawer;
