import { useEffect, useState } from "react"; 
import { api } from "../../../api/axios";
import GridProductsHomePage from "./GridProductsHomePage";
import ProductsSkeleton from "./ProductsSketon";

export default function BestSellersProducts({ limit = 8 }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .get("/api/products", { params: { limit, sort: ['name_asc', 'createdAt_desc'] } })
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]));
  }, [limit]);

  if (!items) return <ProductsSkeleton count={limit} />;
  return (
    <GridProductsHomePage products={items} rows={1} gap={2} />
  );
}
 