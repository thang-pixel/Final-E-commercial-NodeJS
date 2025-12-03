import { Clear, SearchOutlined } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { API_DOMAIN } from '../../constants/apiDomain';
import { api } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';

function SearchHome({ isHomePage = false }) {
  // nếu là seacrh trên home page thì mới hiện kết quả search
  // nếu không thì navigate đến trang products với keyword đã nhập
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    console.log('Searching for:', keyword);

    try {
      const response = await api.get(`${API_DOMAIN}/api/products`, {
        params: { keyword, limit: 20 },
      });
      // console.log('Search response:', response.data.data);
      setSearchResults(response?.data?.data);

    } catch (error) {
      console.log(error);
      setSearchResults([]);
    } finally {
      if (!isHomePage) {
        // Chuyển hướng đến trang products với từ khóa tìm kiếm
        navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
      } else {
        // Mở kết quả tìm kiếm trên trang chủ
        setIsOpenSearchResults(true);
      }
    }
  };

  const searchRef = useRef();
  const [isOpenSearchResults, setIsOpenSearchResults] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        console.log(
          'Clicked outside search results',
          e.target,
          searchRef.current
        );
        setIsOpenSearchResults(false);
      }
    };
    if (isOpenSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenSearchResults]);

  const isShowTransition = (isOk) => {
    let baseTransition =
      'transition-all duration-300 ease-in-out z-30 ';
    if (isOk) {
      return baseTransition + 'visible opacity-100';
    } else {
      return baseTransition + 'invisible opacity-0 pointer-events-none';
    }
  };
  return (
    <div
      className="
      searchProduct
      flex items-center
      rounded-3xl
      bg-white
      border border-zinc-300
      focus-within:border-blue-500
      focus-within:ring-1 focus-within:ring-blue-400
      relative
    "
    >
      <SearchOutlined
        onClick={handleSearch}
        className="ml-2 text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
      />

      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // ✅ Thêm search khi nhấn Enter
        placeholder="Tìm kiếm sản phẩm..."
        className="px-4 py-2 flex-1 focus:outline-none"
      />

      <div
        className={
          (keyword ? 'visible opacity-100 pr-2' : 'invisible opacity-0 pr-2') +
          'cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full p-1  transition-all ease-in-out duration-300'
        }
        onClick={() => setKeyword('')}
      >
        <Clear className="text-gray-500 hover:text-gray-700" />
      </div>

      {/* result search */}
      {/* {isOpenSearchResults && isHomePage && (
        <div
          ref={searchRef}
          className="w-full 
          absolute top-full left-0 
          mt-2 
          bg-white shadow-lg rounded-lg z-20
          "
        >
          {<ResultSearch products={searchResults} keyword={keyword} />}
        </div>
      )} */}

      <div
        ref={searchRef}
        className={`w-full 
          absolute top-full left-0 
          mt-2 
          bg-white shadow-lg rounded-lg
           ${isShowTransition(isOpenSearchResults && isHomePage)}
          `}
      >
        {<ResultSearch products={searchResults} keyword={keyword} />}
      </div>
    </div>
  );
 
}

export default SearchHome;

const ResultSearch = ({ products, keyword }) => {
  const maxShow = 5;

  return (
    <div className="p-2">
      <p>
        Kết quả tìm kiếm với "{keyword}":{' '}
        {products?.length > 0 ? products.length : 0}
      </p>

      <div className="max-h-60 overflow-y-auto">
        {products && products.length > 0 ? (
          products.slice(0, maxShow).map((product) => (
            <div
              key={product._id}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer"
            >
              <Link to={`/products/${product.slug || product._id}`}>
                <div className="flex items-center justify-start">
                  <img
                    src={product.images?.[0].img_url || '/product-default.png'}
                    alt={product.name}
                    className="w-10 h-10 object-contain inline-block mr-2"
                  />
                  <div className="flex flex-col ">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-red-600 font-bold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(product.min_price)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-red-500 text-center">No results found</p>
        )}
      </div>

      <div className="text-center p-2 pb-0 border-t hover:bg-gray-200 cursor-pointer">
        <Link to={`/products?keyword=${encodeURIComponent(keyword)}`}>
          Xem tất cả kết quả
        </Link>
      </div>
    </div>
  );
};
