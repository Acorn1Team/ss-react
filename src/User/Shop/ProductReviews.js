import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const ProductReviews = () => {
    const { no } = useParams();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

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

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FaStar key={i} style={{ color: '#ffcc00' }} />);
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars.push(<FaStarHalfAlt key={i} style={{ color: '#ffcc00' }} />);
            } else {
                stars.push(<FaRegStar key={i} style={{ color: '#cccccc' }} />);
            }
        }
        return stars;
    };

    return (
        <>
        <div>평균 평점: {renderStars(averageRating)} {averageRating}</div>
        {reviews.map((review) => (
            <div key={review.no} style={{ marginBottom: '20px' }}>
                <div>리뷰 번호: {review.no}</div>
                <div>사용자: {review.userNickname}</div>
                <div>제품: {review.productName}</div>
                <div>사진: {review.pic}</div>
                <div>내용: {review.contents}</div>
                <div>점수: {renderStars(review.score)} {review.score}</div>
            </div>
        ))}
        </>
    );
};

export default ProductReviews;
