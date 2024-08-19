import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PostWrite() {
  const { productNo } = useParams();
  const [productInfo, setProductInfo] = useState({});
  const [productList, setProductList] = useState([]);
  const [selected, setSelected] = useState("0"); // 기본값을 "0"으로 설정
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [content, setContent] = useState(""); // Content 상태 관리

  const navigate = useNavigate();
  const userNo = 3;

  // 상품 불러오기
  const getProductInfo = (pNo) => {
    axios
      .get(`/list/product/${pNo}`)
      .then((res) => {
        if (pNo === productNo) {
          setProductInfo(res.data); // productNo로 불러온 상품 정보를 productInfo에 설정
        } else {
          setSelectedProductInfo(res.data); // 선택한 상품 정보를 selectedProductInfo에 설정
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getProductList = () => {
    axios
      .get(`/list`)
      .then((res) => setProductList(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  const insertPost = () => {
    const finalProductNo = productNo
      ? productNo
      : selectedProductInfo
      ? selectedProductInfo.no
      : 0;

    axios
      .post("/posts/detail", {
        userNo: userNo,
        content: content, // 상태에서 가져옴
        productNo: finalProductNo,
        likesCount: 0,
        commentsCount: 0,
        reportsCount: 0,
        //   pic:, 사진 등록 구현 예정
      })
      .then((res) => {
        if (res.data.result) {
          navigate(`../list/${userNo}`);
        }
      })
      .catch((error) => {
        document.querySelector("#error").innerHTML = "등록 실패";
        console.log("등록 실패 :", error);
      });
  };

  const handleSelectChange = (e) => {
    const selectedProductNo = e.target.value;
    setSelected(selectedProductNo);
    getProductInfo(selectedProductNo);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value); // Content 상태를 업데이트
  };

  useEffect(() => {
    if (productNo) {
      getProductInfo(productNo);
    } else {
      getProductList();
    }
  }, [productNo]);

  return (
    <div>
      <div id="photoBox"></div>
      <input type="file" />
      <br />

      <textarea
        style={{ width: "50%" }}
        id="contentBox"
        value={content}
        onChange={handleContentChange} // 입력값 변경 시 상태 업데이트
      ></textarea>
      <div id="productBox">
        {productNo ? (
          <div>
            인용한 상품
            <br />
            {productInfo.pic} {productInfo.name} {productInfo.price}
          </div>
        ) : (
          <div>
            상품 목록
            <br />
            <select value={selected} onChange={handleSelectChange}>
              <option value="0">상품 선택</option>
              {productList.map((pl) => (
                <option key={pl.no} value={pl.no}>
                  {pl.name}
                </option>
              ))}
            </select>
            {selectedProductInfo && (
              <div>
                <br />
                선택한 상품 정보
                <br />
                {selectedProductInfo.pic} {selectedProductInfo.name}{" "}
                {selectedProductInfo.price}
              </div>
            )}
          </div>
        )}
      </div>
      <button onClick={() => insertPost()}>등록</button>
      <b id="error"></b>
    </div>
  );
}
