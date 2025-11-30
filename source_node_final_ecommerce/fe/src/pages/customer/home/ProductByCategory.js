import { useEffect, useMemo, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../../redux/reducers/productSlice';
import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon';
import { getAllProductApi } from '../../../api/productApi';
import { data } from 'react-router-dom';

export default function ProductByCategory({ data, limit = 8 }) { 

  if (!data) return <ProductsSkeleton count={limit} />;
  return <GridProductsHomePage products={data} />;
}
 