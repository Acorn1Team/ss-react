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
  const handleClick = (item) => {
    setProductInfo(item); // 선택된 상품 정보를 설정
    setInputValue(item.name); // 선택된 상품의 이름을 검색창에 표시
    setShowDropdown(false); // 드롭다운을 닫음
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
      <br />

      <textarea
        className={styles.contentBox}
        value={content}
        onChange={handleContentChange}
      ></textarea>
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
                {productInfo.price}
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
