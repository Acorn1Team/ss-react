import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProductByCate() {
    const { category } = useParams();  // useParams를 사용하여 현재 URL에서 카테고리 파라미터를 가져옴
    const [products, setProducts] = useState([]);
    const [selectCategory, setSelectCategory] = useState(category || ''); // 선택된 카테고리를 상태로 관리

    const categories = ['Category1', 'Category2', 'Category3', 'Category4']; // 상의, 하의, 신발, 기타

    const refresh = (category) => {
        // Ajax 요청으로 선택된 카테고리에 해당하는 제품 목록을 가져옴
        axios
            .get(`/list/category/${category}`)
            .then((res) => {
                setProducts(res.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        if (selectCategory) {
            refresh(selectCategory); // 선택된 카테고리에 따라 제품 목록을 가져옴
        }
    }, [selectCategory]); // selectCategory가 변경될 때마다 useEffect 실행

    const handleCategoryChange = (newCategory) => { // 버튼 눌러서 핸들러
        setSelectCategory(newCategory); // 카테고리가 변경될 때 상태 업데이트
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
                        <div>사진: <img src={product.pic} alt={product.name} /></div>
                        <div>할인율: {product.discountRate}</div>
                        <div>평점: {product.score}</div>
                        <div>리뷰 수: {product.reviews}</div>
                    </div>
                ))}
            </div>

        </>
    );
}

export default ProductByCate;
