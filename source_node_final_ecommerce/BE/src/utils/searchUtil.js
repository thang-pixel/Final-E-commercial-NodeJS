const sortObj = (sort_whitelist, default_field = 'name', req) => {
    // --- Sort ---
    // Hỗ trợ nhiều tham số sort: ?sort=price_asc&sort=createdAt_desc

    const sortParams = Array.isArray(req.query.sort)
        ? req.query.sort
        : req.query.sort
        ? [req.query.sort]
        : [];

    // console.log("Sort parameters received: ", sortParams);

    const sortObj = {};
    for (const token of sortParams) {
        // token: min_price_asc, max_price_desc, name_asc
        const raw = String(token).trim().split('_');

        const rawOrder = raw.pop();
        const rawField = raw.join('_');

        const field = sort_whitelist[rawField];
        if (!field) continue;
        const order = (rawOrder || 'asc').toLowerCase() === 'asc' ? 1 : -1;
        sortObj[field] = order;
    }

    console.log("Constructed sort object: ", sortObj);

    // Mặc định: mới nhất trước, rồi name để ổn định
    if (Object.keys(sortObj).length === 0) {
        sortObj.createdAt = -1;
        sortObj[default_field] = 1;
    } else {
        // Luôn có tie-breaker để ổn định phân trang
        if (!(default_field in sortObj)) sortObj[default_field] = 1;
    }

    return sortObj;
};

const filterProduct = (filter, brand_ids, range_prices, ratings) => {
    
    let brand_id_arr = [];
    if (typeof brand_ids === 'string' && brand_ids.trim()) {
        brand_id_arr = brand_ids.split(',').map((id) => Number(id.trim()));
    }

    let range_prices_arr = [];
    if (typeof range_prices === 'string' && range_prices.trim()) {
        range_prices_arr = range_prices.split(',').map((p) => {
                const [min, max] = p.split('-').map((x) => Number(x.trim()));
                return { min, max };
            });
    }

    let ratings_arr = [];
    if (typeof ratings === 'string' && ratings.trim()) {
        ratings_arr = ratings.split(',').map((r) => Number(r.trim()));
    }

    if (brand_id_arr.length > 0) {
        filter.brand_id = { $in: brand_id_arr };
    }
    if (range_prices_arr.length > 0) {
        const priceConditions = range_prices_arr.map(({ min, max }) => {
            if (isNaN(min)) min = 0;
            if (isNaN(max)) max = Number.MAX_SAFE_INTEGER;
            return {
                min_price: { $gte: min, $lte: max },
            };
        });

        // Nếu đã có $or (từ keyword), dùng $and để kết hợp
        if (filter.$or) {
            filter.$and = [
                { $or: filter.$or },
                { $or: priceConditions },
            ];
            delete filter.$or;
        } else {
            // Chưa có $or, gán trực tiếp
            filter.$or = priceConditions;
        }
    }
    if (ratings_arr.length > 0) {
        filter.average_rating = { $in: ratings_arr };
    }

    console.log("Filter after processing:", filter);
    return filter;
};

const paginationParam = (req, limitDefault = 5) => {
    const page = parseInt(req.query.page, 10) || 1;

    let limit = parseInt(req.query.limit, 10) || limitDefault;
    // Giới hạn max 50 items/trang
    limit = Math.min(Math.max(1, limit), 50);
    const skip = (page - 1) * limit;


    return { page, limit, skip };
};

const selectFieldByRole = (role) => {
  let fieldsToHide = '';
  if (role !== 'admin') {
    // fieldsToHide += '-variants.original_price ';
  }
  return fieldsToHide;
}

module.exports = {
    sortObj,
    filterProduct,
    paginationParam,
    selectFieldByRole,
};
