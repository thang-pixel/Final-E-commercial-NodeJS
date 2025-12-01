import { api } from './axios';

// content, display_name, value
const updateRatingApi = async (user_id, product_id, ratingData) => {
  const resp = await api.put(
    `/api/ratings/user/${user_id}/rate/${product_id}`,
    ratingData
  );
  return resp.data;
};


// lấy đánh giá theo product id và user id
const getRatingByUserAndProductApi = async (user_id, product_id) => {
  const resp = await api.get(
    `/api/ratings/user/${user_id}/rate/${product_id}`
  );
  return resp.data;
};


export { updateRatingApi, getRatingByUserAndProductApi };
