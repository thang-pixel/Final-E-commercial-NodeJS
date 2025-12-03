import GridProductsBestSellers from "./GridProductsBestSellers";
import GridProductsHomePage from "./GridProductsHomePage";
import ProductsSkeleton from "./ProductsSketon";

export default function BestSellersProducts({ data }) {
  

  if (!data) return <ProductsSkeleton count={8} />;
  return (
    <GridProductsBestSellers products={data} rows={1} gap={2} />
  );
}
  