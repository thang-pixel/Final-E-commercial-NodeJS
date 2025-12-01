import CategoryItemHomeCustom from "./CategoryItemHomeCustom";
import './CategoryCustomer.css';

const CategoryListHomeCustom = ({ categories=[], className, styles }) => {
  return (
    <ul className={`flex flex-col gap-2 ${className}`} style={styles}>
      {categories.map((cate) => (
        <CategoryItemHomeCustom key={cate._id} cate={cate} />
      ))}
    </ul>
  );
}

export default CategoryListHomeCustom;