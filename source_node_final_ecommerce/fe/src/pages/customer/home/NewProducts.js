import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../../redux/reducers/productSlice';
import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon';
import { api } from '../../../api/axios';

export default function NewProducts({ data }) { 
  if (!data) return <ProductsSkeleton count={8} />;
  return <GridProductsHomePage products={data} rows={1} gap={2} />;
}
