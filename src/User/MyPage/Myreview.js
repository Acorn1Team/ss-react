import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import axios from "axios";

function Myreview(){
    const { userNo } = useParams(); //userNo
    const [reviews, setReviews] = useState([]); // 구매 제품 리스트
    const {reviewNo} = useParams(); // 리뷰번호
 
    //  리뷰 데이터 가져오기
    const myreviewOnly = () => {
        axios
        .get(`/mypage/review/${userNo}`)
        .then((res) => {
            //console.log(res.data); // 응답 데이터 확인
            if (res.data.reviews) {
                setReviews(res.data.reviews); // userid당 주문 제목 이랑 리뷰
            } else {
                setReviews([]); // 데이터가 없는 경우 빈 배열로 설정
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        myreviewOnly(); 
    }, []); 

    const deleteReview = (reviewNo) => {
        axios
        .delete(`/review/delete/${reviewNo}`)
        .then((res) => {
            // 리뷰 삭제 후 리뷰 리스트를 다시 불러옴
            setReviews(reviews.filter(review => review.no !== reviewNo));
        })
        .catch((error) => {
            console.log(error);
        });
    }


    return(
        <>
       {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((mybuyProducts) => (
                <div key={mybuyProducts.no}>
                    <div>리뷰 번호: {mybuyProducts.no}</div>
                    <div>사용자: {mybuyProducts.userNickname}</div>
                    <div>제품: {mybuyProducts.productName}</div>
                    <div>사진: {mybuyProducts.pic}</div>
                    <div>리뷰 평점: {mybuyProducts.score}</div>
                    <div>리뷰 평점: {mybuyProducts.contents}</div>
                    <button onClick={() => deleteReview(mybuyProducts.no)}>삭제</button>
                    
                </div>
            ))
          ) : (
            <div>리뷰가 없습니다.</div>
          )}
        </>

    );
}

export default Myreview;