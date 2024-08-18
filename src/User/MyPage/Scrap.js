import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// 마이페이지에서 접근(미연동 상태)
// user/mypage/scrap/유저번호
export default function Scrap() {
  // 유저 번호
  const { no } = useParams();

  // 스크랩 리스트 정보 저장용
  const [scrapList, setScrapList] = useState([]);

  // 스크랩한 정보 가져오기
  const getScrapList = () => {
    axios
      .get(`/myScrapPage/${no}`)
      .then((res) => setScrapList(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getScrapList();
  }, []);

  return (
    <div>
      {scrapList.map((sl) => (
        <div key={sl.no}>
          <Link to={`/user/main/sub/${sl.no}`}>
            {sl.name}
            {sl.pic}
          </Link>
        </div>
      ))}
    </div>
  );
}
