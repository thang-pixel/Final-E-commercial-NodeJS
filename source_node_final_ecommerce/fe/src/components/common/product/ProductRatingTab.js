import { useState } from "react";
import useAuth from "../../../hooks/authHook";

const labels = {
  1: 'Tệ',
  2: 'Không hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Rất tốt',
};

function getLabelText(value) {
  return `${value} sao, ${labels[value] || ''}`;
}

const ProductRating = () => {
    const { user } = useAuth();
    const [value, setValue] = useState(0);
    const [hover, setHover] = useState(-1);
    const [averageRating, setAverageRating] = useState(0);
    const [count, setCount] = useState(0);
    

    return (
        <div>
            <h2>Product Rating Component</h2>
        </div>
    );
}

export default ProductRating;