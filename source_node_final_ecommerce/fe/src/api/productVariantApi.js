
const { api } = require("./axios");

const getProductVariantsApi = (productId) => {
  try { 
    const resp = api.get(`/api/product-variants/products/${productId}/variants`);
    return resp.data;
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data.message : error.message,
      message: error.message || 'Lỗi khi lấy danh sách variant'
    }
  }
}

const getVariantByIdApi = async(variantId, productId) => {
  try {
    const resp = await api.get(`/api/product-variants/products/${productId}/variants/${variantId}`);
    return resp.data;
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data.message : error.message,
      message: error.message || 'Lỗi khi lấy variant theo ID'
    }
  }
}

export {
  getProductVariantsApi,
  getVariantByIdApi
}