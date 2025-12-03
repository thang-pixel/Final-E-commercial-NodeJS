import { api } from "./axios";

const getAllProductApi = async(params) => {
  const resp = await api.get('/api/products', { params });

  // console.log('Resp product all: ', resp, ' | Params', params);
  return {
    responseApi: resp.data
  }
} 

const getProductBySlugApi = async(slug) => {
  const resp = await api.get(`/api/products/${slug}`);

  // console.log('Resp product by slug: ', resp, ' | Slug', slug);
  return resp.data;
}

const changeProductStatusApi = async(id, status) => {
  const resp = await api.patch(`/api/products/${id}/change-status`, { status });

  // console.log('Resp change product status: ', resp, ' | Id', id, ' | Status', status);
  return resp.data;
}

export  {
  getAllProductApi,
  getProductBySlugApi,
  changeProductStatusApi
}
