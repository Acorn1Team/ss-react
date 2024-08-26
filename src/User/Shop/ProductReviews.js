import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';

const ProductReviews = () => {
    const { no } = useParams();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0); //리뷰 평균

    const reviewData = () => {
        axios
        .get(`/list/review/${no}`)
        .then((res) => {
            const reviewsData = res.data.reviews || [];
            setReviews(reviewsData);

            // 평균 평점 계산
            if (reviewsData.length > 0) {
                const totalRating = reviewsData.reduce((acc, review) => acc + (parseFloat(review.score) || 0), 0);
                setAverageRating((totalRating / reviewsData.length).toFixed(1));
            } else {
                setAverageRating(0);
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        reviewData();
    }, [no]);

    return (
        <>
        <div>평균 평점: {averageRating}</div>
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
