import IconButton from '@mui/material/IconButton';
import { AddShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/reducers/cartSlice';
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Rating,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useEffect } from 'react';
import { getProductBySlug } from '../../redux/reducers/productSlice';
import Gallery from '../common/Gallery';
import { useMemo } from 'react';
import stringUtils from '../../utils/stringUtils';
import ProductQuickView from '../common/ProductQuickView';

export default function ProductCard({ product }) {
  const {
    _id,
    name,
    description,
    images,
    slug,
    min_price: price_from,
    average_rating: rating_avg,
    review_count: rating_count,
  } = product;
  const dispatch = useDispatch();
  const [isOpenQuickView, setIsOpenQuickView] = useState(false);

  const raw = images?.[0]?.img_url || '';
  const thumbnail = raw; // url ảnh trên cloudinary đã là url đầy đủ
 

  return (
    <>
      <div
        className="productCard group cursor-pointer w-full flex flex-col h-full 
          border rounded-xl shadow-sm hover:shadow-xl
          hover:scale-[1.02] hover:bg-gray-100 
          transition-all duration-200 
          min-w-0 overflow-hidden bg-white dark:bg-gray-800
          relative"
      >
        <Link
          to={`/products/${slug || _id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
          className="flex flex-col h-full"
        >
          {/* ✅ Set chiều cao cố định cho thumbnail */}
          <div className="productCard---thumbnail w-full h-48 bg-white flex-shrink-0">
            <div className="w-full h-full overflow-hidden rounded-t-lg flex items-center justify-center p-2">
              <img
                src={thumbnail}
                alt={name}
                className="object-contain w-full h-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* ✅ Flex-grow để info chiếm phần còn lại */}
          <div className="productCard--info text-center w-full flex-grow flex flex-col justify-between p-2">
            <div>
              <div className="productCard---name font-semibold text-lg line-clamp-2 break-words group-hover:text-orange-400 transition-all duration-200 mb-2">
                {name}
              </div>
              <div className="productCard---price font-bold text-base text-red-600 mb-2">
                {formatVND(price_from)}
              </div>
            </div>

            <div className="productCard---actions flex justify-center">
              <div className="productCard---ratings flex justify-center items-center gap-x-1 text-sm text-yellow-500">
                <span>{rating_avg ? rating_avg.toFixed(1) : 0.0}</span>
                <span>({rating_count ?? 0})</span>
              </div>
            </div>
          </div>
        </Link>

        {/* ✅ Button add to cart */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpenQuickView(true);
            // handleAddToCart(product);
          }}
          className="productCard---add-to-cart  
            flex items-center gap-x-1
            text-cyan-300 hover:text-cyan-500
            absolute bottom-2 right-2 bg-white rounded-full shadow-lg p-1
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-300 ease-in-out
            transform translate-y-2 group-hover:translate-y-0"
        >
          <span
            className="
                        absolute inset-0
                        bg-cyan-200
                        transform scale-x-0
                        origin-right
                        transition-transform duration-400 ease-linear
                        rounded-full
                        group-hover:scale-x-100
                      "
          />

          <span className="relative z-10 font-semibold text-sm col text-black">
            Add to cart
          </span>
          <IconButton color="primary" size="large" aria-label="Add to cart">
            <AddShoppingCart />
          </IconButton>
        </div>
      </div>
      <ProductQuickView
        isOpen={isOpenQuickView}
        setIsOpen={setIsOpenQuickView}
        product={product}
      />
    </>
  );
}

function formatVND(v) {
  if (v == null) return '—';
  return v.toLocaleString('vi-VN') + '₫';
}
