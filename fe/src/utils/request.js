const API_DOMAIN = "http://localhost:8000/";


const getToken = () => (localStorage.getItem("access_token"));
export const get = async (path) => {
  
  const res = await fetch(API_DOMAIN + path, {
    method: "GET",
    headers: {
      Accept: "application/json", 
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const rs = await res.json();
  return rs;
};

export const post = async (path, options) => {
  const res = await fetch(API_DOMAIN + path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(options),
  });
  const rs = res.json();
  return rs;
};

export const del = async (path) => {
  const res = await fetch(API_DOMAIN + path, {
    method: "DELETE",
    headers: {
      Accept: "application/json", 
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const rs = res.json();
  return rs;
};

export const edit = async (path, options) => {
  const res = await fetch(API_DOMAIN + path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(options),
  });
  const result = await res.json();
  return result;
};
