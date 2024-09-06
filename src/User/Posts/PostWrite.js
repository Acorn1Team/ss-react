import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/PostWrite.module.css";

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

  // 검색 관련 상태
  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [orderProductList, setOrderProductList] = useState([]);

  const navigate = useNavigate();

  // 로그인 정보라고 가정
  const userNo = sessionStorage.getItem("id");

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

  // 구매한 상품 자료
  const getOrderProductList = () => {
    axios
      .get(`/posts/product/${userNo}`)
      .then((res) => {
        setOrderProductList(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 상품 선택 핸들러
  const handleClick = (item) => {
    setProductInfo(item); // 선택된 상품 정보를 설정
    setInputValue(item.name); // 선택된 상품의 이름을 검색창에 표시
    setSelected(parseInt(item.no, 10)); // 선택된 상품의 번호를 숫자로 설정
    setShowDropdown(false); // 드롭다운을 닫음
  };

  // 상품 등록 혹은 수정
  const insertPost = async (postNo) => {
    const finalProductNo = selected ? parseInt(selected, 10) : 0;

    const formData = new FormData();

    const postDto = {
      userNo: userNo,
      content: content,
      productNo: finalProductNo,
      likesCount: 0,
      commentsCount: 0,
      reportsCount: 0,
    };

    formData.append("postDto", JSON.stringify(postDto));

    const fileInput = document.querySelector("input[type='file']");
    if (fileInput && fileInput.files.length > 0) {
      formData.append("pic", fileInput.files[0]);
    } else {
      // 이미지가 없으면 경고 메시지를 표시하고 함수를 종료합니다.
      document.querySelector("#forFileNull").innerText =
        "사진을 등록해 주세요!";
      return;
    }

    try {
      let res;
      if (postNo) {
        res = await axios.put(`/posts/detail/${postNo}`, formData);
      } else {
        res = await axios.post("/posts/detail", formData);
      }

      console.log("Server response:", res.data); // 서버 응답 확인

      if (res.data.isSuccess) {
        navigate(postNo ? `../detail/${postNo}` : `../list/${userNo}`);
      } else {
        console.log("Failed to save post:", res.data.message);
        document.querySelector("#error").innerText =
          "등록 실패: " + res.data.message;
      }
    } catch (error) {
      console.error("Error occurred:", error);
      document.querySelector("#error").innerText = "등록 실패: 서버 오류 발생";
    }
  };

  // 내용 입력했을 경우를 위한 핸들러
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= 500) {
      setContent(newContent);
    }
  };

  // 수정일 경우 저장되어 있는 post 내용 불러오기
  const getPostInfo = async () => {
    await axios
      .get(`/posts/detail/${postNo}`)
      .then((res) => {
        setContent(res.data.posts.content);
        // 기존 글 내용을 content에 설정
        if (res.data.posts.productNo) {
          getProductInfo(res.data.posts.productNo);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 검색 입력 변화 핸들러
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  // 상품 선택 핸들러
  const handleSelectChange = (e) => {
    const selectedProductNo = e.target.value;
    setSelected(parseInt(selectedProductNo, 10));

    if (selectedProductNo === "0") {
      setProductInfo({});
      return;
    }

    const selectedProduct = orderProductList.find(
      (item) => item.no === parseInt(selectedProductNo, 10)
    );

    if (selectedProduct) {
      setProductInfo(selectedProduct);
    } else {
      console.error("Selected product not found in orderProductList");
      setProductInfo({});
    }
  };

  // 드롭다운 블러 핸들러
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100); // 드롭다운을 약간의 지연 후에 닫음
  };

  useEffect(() => {
    const fetchData = async () => {
      if (inputValue) {
        try {
          const response = await axios.get(
            `/user/search/product?term=${inputValue}`
          );
          if (Array.isArray(response.data)) {
            setFilteredItems(response.data);
          } else {
            console.error("Unexpected response data format");
          }
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFilteredItems([]);
        }
      } else {
        setShowDropdown(false);
      }
    };

    fetchData();
  }, [inputValue]);

  useEffect(() => {
    const loadData = async () => {
      await getProductList();
      await getOrderProductList();

      if (postNo) {
        getPostInfo();
      }

      if (productNo) {
        getProductInfo(productNo);
      }
    };

    loadData();
  }, [postNo, productNo]);

  return (
    <div className={styles.container}>
      <div id="photoBox" className={styles.photoBox}></div>
      {!postNo && <input type="file" />}
      <span style={{ color: "red" }} id="forFileNull"></span>
      <br />

      <div className={styles.textareaContainer}>
        <textarea
          style={{ width: "580px" }}
          value={content}
          onChange={handleContentChange}
        ></textarea>
        <div className={styles.characterCount}>{content.length} / 500</div>
      </div>

      <div className={styles.productBox}>
        상품을 검색해 보세요!&emsp;
        <input
          type="text"
          className={styles.productSearchInput}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="상품 검색..."
        />
        {showDropdown && (
          <div className={styles.dropdownContainer}>
            <div className={styles.dropdown}>
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className={styles.dropdownItem}
                  onMouseDown={() => handleClick(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        )}
        {orderProductList.length > 0 && (
          <div>
            아니면 구매한 상품을 첨부할 수 있어요.
            <select
              value={selected}
              onChange={handleSelectChange}
              className={styles.productSelect}
            >
              <option value="0">구매한 상품을 선택하세요</option>
              {orderProductList.map((item) => (
                <option key={item.no} value={item.no}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {productInfo && productInfo.name && (
          <div className={styles.productInfoContainer}>
            <p>선택한 상품 정보:</p>
            <div className={styles.productInfoDetails}>
              <img
                src={productInfo.pic}
                alt={productInfo.name}
                className={styles.productInfoImage}
              />
              <span className={styles.productInfoName}>{productInfo.name}</span>
              <span className={styles.productInfoPrice}>
                {productInfo.price.toLocaleString()}원
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        className={styles.submitButton}
        onClick={() => insertPost(postNo)}
      >
        {postNo ? "수정" : "등록"}
      </button>
      <b id="error" className={styles.error}></b>
    </div>
  );
}
