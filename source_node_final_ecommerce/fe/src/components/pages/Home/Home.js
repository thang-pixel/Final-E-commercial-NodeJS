import { useOutletContext } from "react-router-dom";
import { Flex, Tabs } from "antd";
import PaymentHistory from "./PaymentHistory";
import Payment from "./Payment";

function Home() {
  const { profile } = useOutletContext();

  const items = [
    {
      key: "1",
      label: "Thanh toán học phí",
      children: <Payment profile={profile} />,
    },
    {
      key: "2",
      label: "Lịch sử thanh toán",
      children: <PaymentHistory profile={profile} />,
    },
  ];

  const onChange = (key) => {
    console.log(key);
  };

  return (
    <>
      <div
        style={{ width: "100vw", display: "flex", justifyContent: "center" }}
      >
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

export default Home;
