import { api } from "./axios"


const loadCartApi = async (userId) => {
  const resp = await api.get(`/api/carts/${userId}`);
  return resp.data;
}

// body: { product_id, variant_id, quantity, price, image_url, name, sku, attributes }
const addToCartApi = async (userId, body) => {
  const resp = await api.post(`/api/carts/${userId}/add`, body); 
  return resp.data;
}

const updateCartItemApi = async (userId, variantId, quantity) => {
  const resp = await api.put(`/api/carts/${userId}/update/`, {
    variantId,
    quantity
  });
  return resp.data;
}

const removeCartItemApi = async (userId, productId, variantId) => {
  const resp = await api.delete(`/api/cart/${userId}/remove-item`, {
    data: { variantId, productId }
  });
  return resp.data;
}

const clearCartApi = async (userId) => {
  const resp = await api.delete(`/api/cart/${userId}/clear`);
  return resp.data;
}

const removeFromCartApi = async (cartId) => {
  const resp = await api.delete(`/api/cart/${cartId}/remove`);
  return resp.data;
}

export {
  addToCartApi,
  loadCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  removeFromCartApi
}