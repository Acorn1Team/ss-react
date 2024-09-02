import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { Link} from "react-router-dom";

export default function MyOrder() {


  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  const [orderList, setOrderList] = useState([]);
  const [productList, setProductList] = useState([]);

  // 로그인 정보라고 가정함
  //const userNo = 31;
const userNo = sessionStorage.getItem("id");

  const getOrderList = () => {
    axios
      .get(`/order/orderlist/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setOrderList(res.data.orderList);
        setProductList(res.data.productList);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    getOrderList();
  }, [userNo, currentPage]);

  return (
    <>
      주문 내역
      {orderList.map((ol) => (
        <div key={ol.no}>
          {ol.no}&emsp;{ol.date}
          <br />
          <div>
            <Link to={`/user/mypage/order/${ol.no}`}>
              {productList.find((pl) => pl.no === ol.productNoList[0])?.name}
              {ol.productNoList.length > 1 && (
                <span> 외 {ol.productNoList.length - 1}건</span>
              )}
            </Link>
          </div>
          {ol.price}&emsp;{ol.state}&emsp;
          <hr />
        </div>
      ))}
      {totalPages > 1 && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <span style={{ margin: "0 10px" }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages}
          >
            다음
          </button>
        </div>
      )}
      
    </>
  );
}
