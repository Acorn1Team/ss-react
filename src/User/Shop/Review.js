import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Review() {
  const { no } = useParams();

  const [reviewData, setReviewData] = useState([]);

  const getReviewData = () => {
    axios
      .get(`/mypage/review/detail/${no}`)
      .then((res) => setReviewData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getReviewData();
  }, [no]);

  return (
    <div>
      <Link to={`/user/shop/productlist/detail/${reviewData.productNo}`}>{reviewData.productName}</Link>
      <br />@{reviewData.userNickname}
      <br />
      <img src={reviewData.pic} alt={`${reviewData.productName} 사진`} />
      <br />
      {reviewData.contents}
      <br />
      {reviewData.score}별점멋진css적용예정!!(현정언니가)
    </div>
  );
}
