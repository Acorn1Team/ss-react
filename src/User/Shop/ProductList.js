import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import styles from "../Style/ProductList.module.css";

export default function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState(""); // 기본적으로 셀렉트 박스는 선택되지 않은 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12); // 페이지당 상품 수
  const [totalPages, setTotalPages] = useState(1);
  const [selectCategory, setSelectCategory] = useState(category || "");
  const [excludeSoldOut, setExcludeSoldOut] = useState(false); // 품절 상품 제외 여부

  const categories = ["전체", "상의", "하의", "신발", "기타"];

  // 데이터 새로고침: 카테고리 및 정렬 기준에 따라
  const refresh = (selectedCategory, sortOption) => {
    const endpoint =
      selectedCategory && selectedCategory !== "전체"
        ? `/list/category/${selectedCategory}`
        : "/list"; // "전체"일 때는 기본 전체 상품 목록 호출

    axios
      .get(endpoint)
      .then((res) => {
        let sortedProducts = sortProducts(res.data.content, sortOption); // 정렬 기준 적용
        if (excludeSoldOut) {
          sortedProducts = sortedProducts.filter(
            (product) => product.stock > 0
          ); // 품절 상품 제외
        }
        setProducts(sortedProducts);
        setTotalPages(Math.ceil(sortedProducts.length / pageSize)); // 페이지 수 계산
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (newCategory) => {
    setSelectCategory(newCategory); // 선택한 카테고리 업데이트
    setCurrentPage(0); // 페이지 초기화

    // 모든 카테고리를 선택하면 sortOption을 "latest"로 설정
    setSortOption("latest");
    refresh(newCategory, "latest"); // 최신순으로 상품 목록 새로고침
  };

  // 컴포넌트가 마운트되거나 카테고리가 변경될 때 새로고침
  useEffect(() => {
    refresh(selectCategory, sortOption);
  }, [selectCategory, sortOption, excludeSoldOut]);

  // 정렬 함수
  const sortProducts = (products, option) => {
    let sorted = [...products];
    switch (option) {
      case "latest":
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
        break;
      case "sales":
        sorted.sort((a, b) => b.count - a.count); // 판매순
        break;
      case "priceHigh":
        sorted.sort((a, b) => b.price - a.price); // 가격 높은 순
        break;
      case "priceLow":
        sorted.sort((a, b) => a.price - b.price); // 가격 낮은 순
        break;
      case "rating":
        sorted.sort((a, b) => b.score - a.score); // 평점순
        break;
      case "reviews":
        sorted.sort((a, b) => b.reviews - a.reviews); // 리뷰 많은 순
        break;
      default:
        break;
    }
    return sorted;
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option); // 사용자가 선택한 정렬 옵션 설정
    refresh(selectCategory, option); // 정렬 옵션을 변경했을 때 새로고침
  };

  // 품절 상품 제외 체크박스 핸들러
  const handleExcludeSoldOutChange = (e) => {
    setExcludeSoldOut(e.target.checked); // 품절 상품 제외 여부 설정
  };

  // 현재 페이지에 맞는 제품 목록을 자르기
  const paginatedProducts = products.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label id={styles.sortOptions} className={styles.sortOptions}>
          정렬 기준:
          <select
            id={styles.sortSelect}
            className={styles.sortSelect}
            value={sortOption} // 현재 선택된 정렬 옵션
            onChange={handleSortChange}
          >
            <option value="" disabled>
              선택해주세요
            </option>
            <option value="latest">최신순</option>
            <option value="sales">판매순</option>
            <option value="priceHigh">가격 높은 순</option>
            <option value="priceLow">가격 낮은 순</option>
            <option value="rating">평점순</option>
            <option value="reviews">리뷰 많은 순</option>
          </select>
        </label>
        <label className={styles.excludeSoldOut}>
          <input
            type="checkbox"
            checked={excludeSoldOut}
            onChange={handleExcludeSoldOutChange}
          />
          품절 상품 제외
        </label>
      </div>

      <div className={styles.categoryLinks}>
        {categories.map((cate, index) => (
          <button
            key={index}
            className={`${styles.categoryLink} ${
              selectCategory === cate ? styles.activeCategoryLink : ""
            }`} // 선택된 카테고리 활성화
            onClick={() => handleCategoryChange(cate)}
          >
            {cate}
          </button>
        ))}
      </div>

      <div className={styles.productList}>
        {paginatedProducts.map((product) => (
          <div
            key={product.no}
            className={`${styles.productItem} ${
              product.stock === 0 ? styles.soldOutOverlay : ""
            }`}
          >
            {product.stock === 0 && (
              <div className={styles.soldOutMessage}>품절된 상품입니다.</div>
            )}
            <div className={styles.productImage}>
              <Link to={`/user/shop/productlist/detail/${product.no}`}>
                <img src={product.pic} alt={`${product.name} 사진`} />
              </Link>
            </div>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.productPrice}>
              {product.price.toLocaleString()}원
            </div>
            <div className={styles.productCategory}>{product.category}</div>
            <div>
              {product.discountRate === 0
                ? ""
                : `${product.discountRate}% 할인`}
            </div>
            <div>평점: {product.score}</div>
            <div>리뷰 수: {product.reviews}</div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <span>
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
    </div>
  );
}
