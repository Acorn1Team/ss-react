import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';

const ProductReviews = () => {
    const { no } = useParams();
    const [reviews, setReviews] = useState([]); // 리뷰 리스트 상태

    // 리뷰 데이터 가져오기
    const reviewData = () => {
        axios
        .get(`/list/review/${no}`)
        .then((res) => {
            setReviews(res.data.reviews); // 리뷰 데이터를 상태로 설정
        })
        .catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        reviewData(); 
    }, []);

    return(
        <>
        {reviews.map((review) => (
            <div key={review.no}>
                <div>리뷰 번호: {review.no}</div>
                <div>사용자: {review.userNickname}</div>
                <div>제품: {review.productName}</div>
                <div>사진: {review.pic}</div>
                <div>내용: {review.contents}</div>
                <div>점수: {review.score}</div>
            </div>
        ))}
        </>
    );
};

export default ProductReviews;
