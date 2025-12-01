import GridProductsHomePage from './GridProductsHomePage';
import ProductsSkeleton from './ProductsSketon'; 

export default function ProductByCategory({ data, limit = 8 }) { 

  if (!data) return <ProductsSkeleton count={limit} />;
  return <GridProductsHomePage products={data} />;
}
 