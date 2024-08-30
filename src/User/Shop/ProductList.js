import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../Style/ProductList.module.css";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("latest"); // 최신순이 기본값
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [pageSize, setPageSize] = useState(12); // 페이지 크기
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  
  const refresh = () => {
    // ajax 요청 (get 방식)
    axios
      .get("/list", {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setProducts(res.data.content); // Page 객체의 content를 가져옴
        setTotalPages(res.data.totalPages);
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

  useEffect(() => {
    refresh(); //ajax 요청 처리가 됨
  }, [currentPage]);

  // 정렬 옵션
  const sortProducts = (products, option) => {
    switch (option) {
      case "latest":
        return products.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
      case "sales":
        return products.sort((a, b) => b.count - a.count); // 판매순
      case "priceHigh":
        return products.sort((a, b) => b.price - a.price); // 가격 높은 순
      case "priceLow":
        return products.sort((a, b) => a.price - b.price); // 가격 낮은 순
      default:
        return products;
    }
  };

  const sortedProducts = sortProducts([...products], sortOption); // 정렬된 리스트

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
        <Link
          to="/user/shop/productlist/category/상의"
          className={styles.categoryLink}
        >
          상의
        </Link>
        <Link
          to="/user/shop/productlist/category/하의"
          className={styles.categoryLink}
        >
          하의
        </Link>
        <Link
          to="/user/shop/productlist/category/신발"
          className={styles.categoryLink}
        >
          신발
        </Link>
        <Link
          to="/user/shop/productlist/category/기타"
          className={styles.categoryLink}
        >
          기타
        </Link>
      </div>

      <div className={styles.productList}>
        {sortedProducts.map((product) => (
          <div key={product.num} className={styles.productItem}>
            <div className={styles.productImage}>
              <Link to={`/user/shop/productlist/detail/${product.no}`}>
                <img src={product.pic} alt={`${product.name} 사진`} />
              </Link>
            </div>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.productPrice}>{product.price}원</div>
            <div className={styles.productCategory}>{product.category}</div>
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
