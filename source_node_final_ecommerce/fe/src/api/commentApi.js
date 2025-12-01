import { api } from "./axios";

// load comments by product id
const loadComments = async (product_id, params) => {
  const resp = await api.get(`/api/comments/${product_id}/comments-by-product`, { params });
  return resp.data;
}

// create comment: content , display_name, parent_comment
const createComment = async (product_id, commentData) => {
  const resp = await api.post(`/api/comments/${product_id}/add-comment`, commentData);
  return resp.data;
}

// admin
const deleteCommentById = async (comment_id) => {
  const resp = await api.delete(`/api/comments/${comment_id}`);
  return resp.data;
}

export {
  loadComments, createComment, deleteCommentById
}