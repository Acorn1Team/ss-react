import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import styles from "../Style/ProductList.module.css";

export default function ProductList() {
  const { category } = useParams(); // useParams를 사용하여 URL에서 카테고리 가져오기
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("latest"); // 기본 정렬 옵션: 최신순
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [pageSize, setPageSize] = useState(12); // 페이지 크기
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [selectCategory, setSelectCategory] = useState(category || ""); // 선택된 카테고리

  const categories = ["상의", "하의", "신발", "기타"]; // 카테고리 목록

  const refresh = (selectedCategory, page = 0, size = pageSize) => {
    const endpoint = selectedCategory
      ? `/list/category/${selectedCategory}`
      : "/list";

    axios
      .get(endpoint, {
        params: {
          page: page,
          size: size,
        },
      })
      .then((res) => {
        setProducts(res.data.content); // 제품 목록 업데이트
        setTotalPages(res.data.totalPages); // 전체 페이지 수 업데이트
        setCurrentPage(page); // 현재 페이지 업데이트
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 카테고리 변경 함수
  const handleCategoryChange = (newCategory) => {
    setSelectCategory(newCategory); // 선택된 카테고리 업데이트
    setCurrentPage(0); // 페이지를 0으로 초기화
  };

  useEffect(() => {
    refresh(selectCategory, currentPage, pageSize); // 카테고리, 페이지, 또는 사이즈 변경 시 제품 목록 새로고침
  }, [selectCategory, currentPage, pageSize]);

  // 정렬 함수
  const sortProducts = (products, option) => {
    switch (option) {
      case "latest":
        return products.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬
      case "sales":
        return products.sort((a, b) => b.count - a.count); // 판매순 정렬
      case "priceHigh":
        return products.sort((a, b) => b.price - a.price); // 높은 가격순 정렬
      case "priceLow":
        return products.sort((a, b) => a.price - b.price); // 낮은 가격순 정렬
      default:
        return products;
    }
  };

  const sortedProducts = sortProducts([...products], sortOption); // 정렬된 제품 목록

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label id="sortOptions" className={styles.sortOptions}>
          정렬 기준:
          <select
            id="sortOptions"
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="sales">판매순</option>
            <option value="priceHigh">가격 높은 순</option>
            <option value="priceLow">가격 낮은 순</option>
          </select>
        </label>
      </div>

      <div className={styles.categoryLinks}>
        {categories.map((cate, index) => (
          <button
            key={index}
            className={styles.categoryLink}
            onClick={() => handleCategoryChange(cate)}
          >
            {cate}
          </button>
        ))}
      </div>

      <div className={styles.productList}>
        {sortedProducts.map((product) => (
          <div
            key={product.num}
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
