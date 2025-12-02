import { useSelector } from "react-redux"

const useCart = () => {
  const { carts } = useSelector((state) => state.carts);

  // console.log('useCart carts:', carts);

  return { carts, length: carts?.length || 0, totalPrice: carts.reduce((total, item) => total + item.price, 0) };
}

export default useCart;