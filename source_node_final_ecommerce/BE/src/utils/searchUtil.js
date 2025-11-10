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
        const [rawField, rawOrder] = String(token).split('_');
        const field = sort_whitelist[rawField];
        if (!field) continue;
        const order = (rawOrder || 'asc').toLowerCase() === 'asc' ? 1 : -1;
        sortObj[field] = order;
    }

    // console.log("Constructed sort object: ", sortObj);

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
        range_prices_arr = [
            range_prices.split(',').map((p) => {
                const [min, max] = p.split('-').map((x) => Number(x.trim()));
                return { min, max };
            }),
        ];
    }

    let ratings_arr = [];
    if (typeof ratings === 'string' && ratings.trim()) {
        ratings_arr = ratings.split(',').map((r) => Number(r.trim()));
    }

    if (brand_id_arr.length > 0) {
        filter.brand_id = { $in: brand_id_arr };
    }
    if (range_prices_arr.length > 0) {
        filter.$or = range_prices_arr.map(({ min, max }) => {
            if (isNaN(min)) min = 0;
            if (isNaN(max)) max = Number.MAX_SAFE_INTEGER;
            return {
                price: { $gte: min, $lte: max },
            };
        });
    }
    if (ratings_arr.length > 0) {
        filter.average_rating = { $in: ratings_arr };
    }
    return filter;
};

const paginationParam = (req, limitDefault = 5, total) => {
    const page = parseInt(req.query.page, 10) || 1;

    let limit = parseInt(req.query.limit, 10) || limitDefault;
    // Giới hạn max 50 items/trang
    limit = Math.min(Math.max(1, limit), 50);
    const skip = (page - 1) * limit;

    const totalPages = Math.max(1, Math.ceil(total / limit)); // luôn >= 1 để đáp ứng yêu cầu hiển thị số trang

    return { page, limit, skip, totalPages };
};

module.exports = {
    sortObj,
    filterProduct,
    paginationParam,
};
