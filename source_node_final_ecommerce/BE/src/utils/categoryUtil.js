const CategoryModel = require("../app/models/CategoryModel");

async function getChildCategoryIds(parentId) {
  const children = await CategoryModel.find({ parent_id: parentId }).select("_id");

  let ids = children.map((c) => c._id);

  for (const child of children) {
    const subIds = await getChildCategoryIds(child._id);
    ids = ids.concat(subIds);
  }

  console.log('Child category IDs:', ids);
  return ids;
}

async function buildCategoryTree(parentId = null) {
  const categories = await CategoryModel.find({ parent_id: parentId }).lean();

  return Promise.all(
    categories.map(async (cat) => {
      const children = await buildCategoryTree(cat._id);
      return {
        ...cat,
        children,
      };
    })
  );
}




const categoryUtil = {
  getChildCategoryIds,
  buildCategoryTree,
};
module.exports = categoryUtil;