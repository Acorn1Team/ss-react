import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/PostWrite.module.css";
import "../Style/All.css";

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

  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  // 로그인 정보라고 가정
  const userNo = sessionStorage.getItem("id");

  // 상품 불러오기
  const getProductInfo = async (pNo) => {
    try {
      const res = await axios.get(`/api/list/product/${pNo}`);

      setProductInfo(res.data);
      setSelected(pNo); // 선택된 상품 설정
    } catch (err) {
      console.log(err);
    }
  };

  // 상품 목록 불러오기
  const getProductList = async () => {
    try {
      const res = await axios.get(`/api/list`);
      setProductList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 구매한 상품 자료
  const getOrderProductList = () => {
    axios
      .get(`/api/posts/product/${userNo}`)
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
    if (!postNo && fileInput && fileInput.files.length > 0) {
      // 이미지 파일 확장자 검사
      const file = fileInput.files[0];
      const validExtensions = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!validExtensions.includes(file.type)) {
        document.querySelector("#forFileNull").innerText =
          "이미지 파일만 업로드할 수 있습니다.";
        return;
      }

      formData.append("pic", file);
    } else if (!postNo && (!fileInput || fileInput.files.length === 0)) {
      // 최초 등록일 때만 사진 필수
      document.querySelector("#forFileNull").innerText =
        "사진을 등록해 주세요!";
      return;
    }

    try {
      let res;
      if (postNo) {
        res = await axios.put(`/api/posts/detail/${postNo}`, formData);
      } else {
        res = await axios.post("/api/posts/detail", formData);
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
      .get(`/api/posts/detail/${postNo}`)
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

  // 파일 변경 핸들러 (이미지 미리보기 및 확장자 검사 추가)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const validExtensions = ["image/jpeg", "image/png", "image/gif"];

    if (file) {
      // 파일 확장자 확인
      if (!validExtensions.includes(file.type)) {
        document.querySelector("#forFileNull").innerText =
          "잘못된 파일 형식입니다. 이미지만 업로드할 수 있습니다!";
        setPreviewImage(null); // 미리보기 초기화
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // 미리보기 이미지 설정
        document.querySelector("#forFileNull").innerText = ""; // 오류 메시지 초기화
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null); // 파일이 없으면 미리보기 초기화
    }
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
            `/api/user/search/product?term=${inputValue}`
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

  // 초기화
  const resetButton = () => {
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = "";
    }

    setPreviewImage("");

    setContent("");

    // 상품 정보 초기화
    setProductInfo({});

    // 검색 입력 초기화
    setInputValue("");
  };

  useEffect(() => {
    window.scrollTo(0, 0); // 페이지 로드 시 스크롤을 맨 위로 이동
  }, []);

  return (
    <div className={styles.container}>
      <div>
        <div id="photoBox" className={styles.photoBox}>
          {previewImage && (
            <img
              src={previewImage}
              alt="미리보기"
              className={styles.previewImage} // 미리보기 이미지에 스타일 적용
            />
          )}
        </div>
        {!postNo && <input type="file" onChange={handleFileChange} />}
      </div>
      <span style={{ color: "red" }} id="forFileNull"></span>
      <br />
      <div className={styles.textareaContainer}>
        <textarea value={content} onChange={handleContentChange}></textarea>
        <div className={styles.characterCount}>{content.length} / 500</div>
      </div>{" "}
      <div className={styles.buttonClass}>
        <button className="btn1" onClick={() => insertPost(postNo)}>
          {postNo ? "수정" : "등록"}
        </button>
        <button className="btn1" onClick={resetButton}>
          초기화
        </button>
        <button className="btn3" onClick={() => navigate(-1)}>
          취소
        </button>
        <b id="error" className={styles.error}></b>
      </div>
      <hr />
      <div className={styles.productBox}>
        상품을 검색해 보세요!
        <input
          style={{ width: "95.5%" }}
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
                  onBlur={handleBlur}
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
              {orderProductList
                .filter((item) => item.available)
                .map((item) => (
                  <option key={item.no} value={item.no}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        {productInfo && productInfo.name && (
          <div
            className={styles.productInfoContainer}
            style={{ textAlign: "center" }}
          >
            <h3>선택한 상품 정보</h3>
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
    </div>
  );
}
