import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { getAllProducts } from '../../../redux/reducers/productSlice';
import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon';

export default function NewProducts({ limit = 8 }) {
  const { products: items } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const sort = useMemo(() => ['name_desc', 'createdAt_asc'], []);

  useEffect(() => {
    // Fetch new products when the component mounts
    dispatch(getAllProducts({ limit, sort }));
    // console.log("Products fetched: ", items);
  }, [limit, sort, dispatch]);
  console.log('Rendering NewProducts with items:', items);

  if (!items) return <ProductsSkeleton count={limit} />;
  return  <GridProductsHomePage products={items} rows={1} gap={2} />;
}
 