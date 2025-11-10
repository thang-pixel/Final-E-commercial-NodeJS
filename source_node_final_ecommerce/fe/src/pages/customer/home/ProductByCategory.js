import { useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../../redux/reducers/productSlice';
import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon';

export default function ProductByCategory({ category_id, limit = 8 }) {
  const dispatch = useDispatch();
  const { products: items } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getAllProducts({ category_id, limit }));
  }, [category_id, limit, dispatch]);

  if (!items) return <ProductsSkeleton count={limit} />;
  return <GridProductsHomePage products={items} />;
}
 