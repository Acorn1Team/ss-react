import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function MyOrderDetail() {
  const { orderNo } = useParams();

  const [orderInfo, setOrderInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});

  const [productList, setProductList] = useState([]);
  const [orderProductList, setOrderProductList] = useState([]);

  // 로그인 정보라고 가정
  const userNo = 3;

  const getOrderList = () => {
    axios
      .get(`/order/orderdetail/${orderNo}`, {
        params: {
          userNo: userNo,
        },
      })
      .then((res) => {
        setOrderInfo(res.data.order.orderInfo);
        setProductList(res.data.order.productList);
        setOrderProductList(res.data.order.orderProductList);
        setUserInfo(res.data.user);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getOrderList();
  }, [orderNo]);

  return (
    <div>
      {orderInfo.no}
      <br />
      {orderInfo.state}&emsp;{orderInfo.date}&emsp;{orderInfo.price}
      <br />
      {productList.map((pl) => (
        <div key={pl.no}>
          {pl.name}&emsp;
          {orderProductList.find((op) => op.productNo === pl.no)?.quantity}개
          &emsp;{pl.price}
        </div>
      ))}
      <div>
        주문자 정보
        <br />
        {userInfo.name} 님 <br />
        {userInfo.zipcode}&emsp;{userInfo.address}
        <br />
        {userInfo.tel}
      </div>
    </div>
  );
}
