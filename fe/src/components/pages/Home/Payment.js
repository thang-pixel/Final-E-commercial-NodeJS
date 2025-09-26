import FormPayment from "./FormPayment";
import FormPayer from "./FormPayer";
import FormInfo from "./FormInfo";
import { useState } from "react";
import { Divider } from "antd";

function Payment({ profile }) {
  const [receiverData, setReceiverData] = useState(null);

  const handleReset = () => {
    setReceiverData(null); // reset dữ liệu người nhận
  };

  return (
    <>
      <FormPayer profile={profile} />
      <Divider />
      <FormInfo receiverData={receiverData} setReceiverData={setReceiverData} />
      <Divider />
      <FormPayment
        profile={profile}
        receiverData={receiverData}
        onReset={handleReset}
      />
    </>
  );
}

export default Payment;
