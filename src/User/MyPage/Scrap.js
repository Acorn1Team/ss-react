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

  // 스크랩 취소 함수
  const handleScrapCancel = (scrapNo) => {
    axios
      .delete(`/main/scrap/${scrapNo}/${no}`)
      .then((res) => {
        if (res.data.result === true) {
          // 삭제 성공시 리스트 다시 불러오기
          getScrapList();
        }
      })
      .catch((err) => {
        console.log("스크랩 취소 실패:", err);
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
            <img src={sl.pic} alt={sl.name} />
          </Link>
          <button onClick={() => handleScrapCancel(sl.no)}>스크랩 취소</button>
        </div>
      ))}
    </div>
  );
}
