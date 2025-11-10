import IconButton from '@mui/material/IconButton';
import { AddShoppingCart } from '@mui/icons-material';
import { API_DOMAIN } from '../../../constants/apiDomain';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';

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

  const raw = images?.[0]?.img_url || '';
  const thumbnail = (API_DOMAIN + raw).replace(/([^:]\/)\/+/g, '$1'); // tránh // trùng

  return (
    <>
      <Link
        to={`/products/${slug || _id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div
          className="productCard cursor-pointer w-full flex flex-col gap-y-1 h-full 
                border rounded-xl shadow-sm hover:shadow-xl
                hover:scale-[1.02] transition-all duration-200 
                min-w-0 overflow-hidden bg-white dark:bg-gray-800"
        >
          {' '}
          {/* ✅ cho phép co, tránh nở cột */}
          {/* Thumbnail: KHÔNG dùng h-1/2; dùng khung tỉ lệ */}
          <div className="productCard---thumbnail min-h-28 max-h-48 w-full bg-white my-auto ">
            <div className="w-full h-full overflow-hidden rounded-t-lg flex items-center justify-center">
              <img
                src={thumbnail}
                alt={name}
                className=" object-contain w-full h-full "
                loading="lazy"
              />
            </div>
          </div>
          <div className="productCard--info w-full min-w-0 mt-4">
            {' '}
            {/* ✅ tránh text đẩy nở */}
            <div className="productCard---name px-2 font-semibold text-lg line-clamp-2 break-words hover:text-orange-400 transition-all duration-200">
              {name}
            </div>
            <div className="productCard---description px-2 text-xs text-gray-600 line-clamp-2 break-words">
              {description}
            </div>
            <div className="productCard---price px-2 font-bold text-base text-red-600">
              {formatVND(price_from)}
            </div>
          </div>
          <div className="productCard---actions flex justify-between p-2">
            <div className="productCard---ratings flex items-center gap-x-1 text-sm text-yellow-500">
              <span>{rating_avg ? rating_avg.toFixed(1) : 0.0}</span>
              <span>({rating_count ?? 0})</span>
            </div>
            <div className="productCard---add-to-cart flex items-center gap-x-1 text-cyan-300 hover:text-cyan-500">
              <Typography variant="srOnly">Add to cart</Typography>
              <IconButton color="primary" size="large" aria-label="Add to cart">
                <AddShoppingCart />
              </IconButton>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}

function formatVND(v) {
  if (v == null) return '—';
  return v.toLocaleString('vi-VN') + '₫';
}
