import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';


export default function ProductDetail(){// 제품상세보기
    const {no} = useParams();
    const [products, setProducts] = useState([{}]);

    const refresh = (no) => {
        // Ajax 요청으로 선택된 카테고리에 해당하는 제품 목록을 가져옴
        axios
            .get(`/list/product/${no}`)
            .then((res) => {
               console.log(res.data);
                setProducts(res.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        refresh(no); // 컴포넌트가 마운트될 때, 그리고 no가 변경될 때마다 요청을 보냄
    }, [no]);


    // 할인율에 따른 가격 계산
    const getDiscountedPrice = () => {
        if (products.discountRate > 0) {
            return products.price - (products.price * (products.discountRate / 100));
         }else{
             return products.price;
         }
        };
    return(
        <>
         <h2>상품 상세 정보</h2>
            <div>
                <label>이름: </label>
                <span>{products.name}</span>
            </div>
            <div>
                <label>가격: </label> 
                {/* <span>{products.price}</span> */}

                <span>{getDiscountedPrice()}</span> {/* 할인된 가격을 표시 */}
                {products.discountRate > 0 && (
                    <span>
                        {/* {products.price} 원 */}
                    </span>
                )}


            </div>
            <div>
                <label>할인율: </label>
                <span>{products.discountRate}</span>
            </div>
            <div>
                <label>상품 설명: </label>
                <span>{products.contents}</span>
            </div>
            <div>
                <label>카테고리: </label>
                <span>{products.category}</span>
            </div>
            <div>
                <label>이미지: </label>
                <img src={products.pic} alt={products.name} />
            </div>
            <div>
                <label>평점: </label>
                <span>{products.score}</span>
            </div>
            <div>
                <label>리뷰 보기: </label>
                 <span>111{products.reviewNoList}</span> 
                {products.reviewNoList && products.reviewNoList.length > 0 ? (
                    <div>
                        {products.reviewNoList.map((reviews, index) => (
                            <div key={index}>
                                <div>{reviews.contents}:</div>
                                <br />
                                평점: {reviews.score}
                            </div>
                        ))}
                    </div>
                ) : (
                    <span>리뷰가 없습니다.</span>
                )}
                {/* 
                리뷰쓰기 만들기 (CRUD) --> 마이페이지에서 물건 구입하면 쓸수 있게 해야함
                여기안에 평점5점 만점에 평점도 선택할 수 있게 만들어
                1) 평점 선택
                2) 리뷰 내용
                3) 사진 추가
                */}
            </div>
            
            <br />
        </>
    );
}

