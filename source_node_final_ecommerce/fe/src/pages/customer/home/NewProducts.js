import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../../redux/reducers/productSlice';
import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon';
import { api } from '../../../api/axios';

export default function NewProducts({ limit = 8 }) {
  const [items, setItems] = useState(null);
  const sort = useMemo(() => ['name_desc', 'createdAt_asc'], []);

  useEffect(() => {
    // Fetch new products when the component mounts
    const fetchNewPros = async () => {
      try {
        const resp = await api.get('/api/products', { params: { limit, sort } });
        setItems(resp.data.data)
      } catch (error) {
        console.log('Error fetching new products:', error.response.message);
      }
    };
    fetchNewPros();
    // console.log("Products fetched: ", items);
  }, [limit, sort]);
  
  console.log('Rendering NewProducts with items:', items);

  if (!items) return <ProductsSkeleton count={limit} />;
  return <GridProductsHomePage products={items} rows={1} gap={2} />;
}
