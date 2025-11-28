import { api } from "./axios";

const getAllProductApi = async(params) => {
  const resp = await api.get('/api/products', { params });

  console.log('Resp product all: ', resp, ' | Params', params);
  return {
    responseApi: resp.data
  }
}

export  {
  getAllProductApi
}