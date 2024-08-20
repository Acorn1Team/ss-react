import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PostWrite() {
  const { postNo, productNo } = useParams();

  // 상품 정보
  const [productInfo, setProductInfo] = useState({});

  // 상품 리스트
  const [productList, setProductList] = useState([]);

  // 선택 컨트롤
  const [selected, setSelected] = useState("0");

  // 글 내용
  const [content, setContent] = useState("");

  const navigate = useNavigate();

  // 로그인 정보라고 가정
  const userNo = 3;

  // 상품 불러오기
  const getProductInfo = async (pNo) => {
    try {
      const res = await axios.get(`/list/product/${pNo}`);
      setProductInfo(res.data);
      setSelected(pNo); // 선택된 상품 설정
    } catch (err) {
      console.log(err);
    }
  };

  // 상품 목록 불러오기
  const getProductList = async () => {
    try {
      const res = await axios.get(`/list`);
      setProductList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 상품 등록 혹은 수정
  const insertPost = async (postNo) => {
    if (postNo) {
      const finalProductNo = productNo ? productNo : selected ? selected : 0;

      axios
        .put(`/posts/detail/${postNo}`, {
          content: content,
          productNo: finalProductNo,
          //   pic:, 사진 등록 구현 예정
        })
        .then((res) => {
          if (res.data.result) {
            navigate(`../detail/${postNo}`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      const finalProductNo = productNo ? productNo : selected ? selected : 0;

      try {
        const res = await axios.post("/posts/detail", {
          userNo: userNo,
          content: content,
          productNo: finalProductNo,
          likesCount: 0,
          commentsCount: 0,
          reportsCount: 0,
          //   pic:, 사진 등록 구현 예정
        });
        if (res.data.result) {
          navigate(`../list/${userNo}`);
        }
      } catch (error) {
        document.querySelector("#error").innerHTML = "등록 실패";
        console.log("등록 실패 :", error);
      }
    }
  };

  // 상품 목록에서 선택했을 경우를 위한 핸들러
  const handleSelectChange = (e) => {
    const selectedProductNo = e.target.value;
    setSelected(selectedProductNo);
    getProductInfo(selectedProductNo);
  };

  // 내용 입력했을 경우를 위한 핸들러
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // 수정일 경우 저장되어 있는 post 내용 불러오기
  const getPostInfo = async () => {
    await axios
      .get(`/posts/detail/${postNo}`)
      .then((res) => {
        setContent(res.data.posts.content); // 기존 글 내용을 content에 설정
        if (res.data.posts.productNo) {
          getProductInfo(res.data.posts.productNo);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    // 수정일 경우 등록되어 있는 post 내용 불러오기
    if (postNo) {
      getPostInfo();
    }

    // 상품 인용일 경우 인용 상품 정보
    if (productNo) {
      getProductInfo(productNo);
    } else {
      getProductList();
    }
  }, [postNo, productNo]);

  return (
    <div>
      <div id="photoBox"></div>
      {!postNo && <input type="file" />}
      <br />

      <textarea
        style={{ width: "50%" }}
        id="contentBox"
        value={content}
        onChange={handleContentChange}
      ></textarea>
      <div id="productBox">
        {productNo || selected !== "0" ? (
          <div>
            선택한 상품 정보
            <br />
            <select value={selected} onChange={handleSelectChange}>
              {productList.map((pl) => (
                <option key={pl.no} value={pl.no}>
                  {pl.name}
                </option>
              ))}
            </select>
            <br />
            {productInfo.pic} {productInfo.name} {productInfo.price}
            <br />
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
          </div>
        )}
      </div>
      <button onClick={() => insertPost(postNo)}>
        {postNo ? "수정" : "등록"}
      </button>
      <b id="error"></b>
    </div>
  );
}
