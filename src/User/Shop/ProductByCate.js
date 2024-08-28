import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
 

function ProductByCate() {
    const { category } = useParams();  // useParams를 사용하여 현재 URL에서 카테고리 파라미터를 가져옴
    const [products, setProducts] = useState([]);
    const [selectCategory, setSelectCategory] = useState(category || ''); // 선택된 카테고리를 상태로 관리

    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
    const [pageSize, setPageSize] = useState(3); // 페이지 크기
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수


    const categories = ['상의', '하의', '신발', '기타']; // 상의, 하의, 신발, 기타

    const refresh = (category, page = 0, size = 10) => {
        // Ajax 요청으로 선택된 카테고리에 해당하는 제품 목록을 가져옴
    
        axios
        .get(`/list/category/${category}`, {
            params: {
                page: currentPage,
                size: pageSize,
            },
        })
        .then((res) => {
            setProducts(res.data.content); // 페이지의 content를 가져옴
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

    useEffect(() => {
        if (selectCategory) {
            refresh(selectCategory, currentPage, pageSize); // 선택된 카테고리에 따라 제품 목록을 가져옴
        }
    }, [selectCategory, currentPage, pageSize]); // selectCategory, currentPage, pageSize가 변경될 때마다 useEffect 실행
   
   
    const handleCategoryChange = (newCategory) => {
        setSelectCategory(newCategory); // 카테고리가 변경될 때 상태 업데이트
        setCurrentPage(0); // 카테고리가 변경되면 페이지를 0으로 초기화
    };

    return (
        <>
            <div>
                
                <div>
                    
                    {categories
                    .map((cate, index) => (
                        <button
                            key={index}
                            onClick={() => handleCategoryChange(cate)}
                        >
                            {cate}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                {products.map(product => (
                    <div key={product.num}>
                        <div>번호: {product.no}</div>
                        <div>이름: {product.name}</div>
                        <div>가격: {product.price}</div>
                        <div>등록일: {product.date}</div>
                        <div>카테고리: {product.category}</div>
                        <div>
                            <Link to={`/user/shop/productlist/detail/${product.no}`}><img src={product.pic} alt="{product.name} 사진"/></Link>
                        </div>
                        <div>할인율: {product.discountRate}</div>
                        <div>평점: {product.score}</div>
                        <div>리뷰 수: {product.reviews}</div>
                    </div>
                ))}
            </div>
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
        </>
    );
}

export default ProductByCate;
