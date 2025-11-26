import { Input } from "antd"
import { useEffect, useState } from "react";
import { formatNumber, unFormatNumber, unyFormatNumber } from "../../utils/numberFormat";

const MoneyInput = ({ value, onChange, placeholder, ...props }) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value.toString()));
    } else {
      // setDisplayValue('0');
    }
  }, [value]);
  
  const handleChange = (e) => {
    const val = e.target.value;

    // Chỉ giữ sô
    const numericVal = unFormatNumber(val);

    // Format lại hiển thị
    setDisplayValue(formatNumber(numericVal));

    // Gọi onChange với giá trị số
    if (onChange) {
      onChange(numericVal === "" ? 0 : parseInt(numericVal, 10));
    }

    // 
  }

  return (<>
    <Input 
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder || "Nhập số tiền"}
      {...props}
    />
  </>)
}
export default MoneyInput;