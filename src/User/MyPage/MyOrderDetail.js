import axios from "axios";
import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";

export default function MyOrderDetail() {
  const { orderNo } = useParams();
  const navigate = useNavigate(); // useNavigate 훅 사용
 
  const [orderInfo, setOrderInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});

  const [productList, setProductList] = useState([]);
  const [orderProductList, setOrderProductList] = useState([]);

  // 로그인 정보라고 가정
  const userNo = 31;
  //const userNo = sessionStorage.getItem("id");

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

  const goToReviewPage = (productNo) => {
    // 리뷰 데이터를 서버로 전송
    navigate(`/user/mypage/review/write/${productNo}`, {
      state: { orderNo: orderNo, userNo: userNo }
    });
  };



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
          <button onClick={() => goToReviewPage(pl.no)}>리뷰 쓰기</button>
          {/* <Link to={`/review/write/${productNo}`}>리뷰 쓰기222</Link> */}
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
