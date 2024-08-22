import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
      {reviewData.productName}
      <br />@{reviewData.userNickname}
      <br />
      {reviewData.pic}
      <br />
      {reviewData.contents}
      <br />
      {reviewData.score}별점멋진css적용예정!!(현정언니가)
    </div>
  );
}
