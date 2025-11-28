import { useEffect, useMemo, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../../redux/reducers/productSlice';
import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon';
import { getAllProductApi } from '../../../api/productApi';

export default function ProductByCategory({ category_id, limit = 8 }) {
  const sort = useMemo(() => ['name_asc', 'createdAt_desc'], []);
  const [items, setItems] = useState(null);

  useEffect( () => {
    const fetchProductByCate = async (params) => {
      try {
        const { responseApi } = await getAllProductApi(params);
        console.log(responseApi);
        setItems(responseApi.data)
      } catch (error) {
        console.log(error.message);
      }
    }

    fetchProductByCate({ limit, sort, category_id });

  }, [category_id, limit, sort]);

  if (!items) return <ProductsSkeleton count={limit} />;
  return <GridProductsHomePage products={items} />;
}
 