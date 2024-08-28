import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";


export default function ProductList(){
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState("latest");// 최신순이 기본값
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
    const [pageSize, setPageSize] = useState(10); // 페이지 크기
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수

    const refresh = () => {
        // ajax 요청 (get 방식)
        axios
        .get('/list', {
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
    },[currentPage]); 



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

    return(
        <>
        <div>
        <label id="sortOptions">정렬 기준: </label>
        <select
            id="sortOptions"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
        >
            <option value="latest">최신순</option>
            <option value="sales">판매순</option>
            <option value="priceHigh">가격 높은 순</option>
            <option value="priceLow">가격 낮은 순</option>
        </select>
    </div>

        <Link to="/user/shop/productlist/category/상의">상의</Link>
        <Link to="/user/shop/productlist/category/하의">하의</Link>
        <Link to="/user/shop/productlist/category/신발">신발</Link>
        <Link to="/user/shop/productlist/category/기타">기타</Link>
      
        {sortedProducts.map((product) => ( 
            <div key={product.num}>
            <div>{product.no}</div>
            <div>{product.name}</div>
            <div>{product.price}</div>
            <div>{product.date}</div>
            <div>{product.category}</div>
            {/* <div>{product.pic}</div> */}
            <div>
            <Link to={`/user/shop/productlist/detail/${product.no}`}><img src={product.pic} alt="{product.name} 사진"/></Link>
            </div>
            <div>{product.discountRate}</div>
            <div>{product.score}</div>

            
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
    )
}