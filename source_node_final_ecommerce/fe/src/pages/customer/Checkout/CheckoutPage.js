const loadCheckoutItems = () => {
  try {
    const items = JSON.parse(localStorage.getItem('checkout_items')) || [];
    return items;
  } catch (error) {
    console.error('Error loading checkout items from localStorage: ', error);
    return [];
  }
};
const CheckoutPage = () => {
  const checkoutItems = loadCheckoutItems();

  return (
    <>
      <div className="checkout-page container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Checkout Page</h2>
        {checkoutItems.length === 0 ? (
          <p>Your checkout cart is empty.</p>
        ) : (
          <>{checkoutItems.length} items in your checkout cart.</>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;
