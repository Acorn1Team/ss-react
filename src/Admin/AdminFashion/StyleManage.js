import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function StyleManage() {
  const { no } = useParams(); // {}로 감싸야 객체 비구조화 문법으로 useParams()가 반환하는 객체에서 no라는 속성만을 추출
  const [styles, setStyles] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  const {actorData} = location.state || {}; // 전달된 state에서 actorData 추출

  useEffect(() => {
    axios
      .get(`/admin/fashion/character/${no}`)
      .then((response) => { // 해당 배역의 스타일 정보
        setStyles(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [no]);

  if (!actorData) { return <p>상세 정보를 불러올 수 없습니다.</p>; }

  return (
    <>
        <div>
        <img src={actorData.pic} alt='{actorData.character} 이미지' />
        {actorData.character} ({actorData.actor}) 의 스타일
        </div>
        <table>
        <thead>
            <th>스타일</th><th>아이템</th>
        </thead>
        <tbody>
          {styles.map((styleData, index) => (
            <tr key={index}>
              <td><img src={styleData.pic} alt='{index}번 캐릭터의 스타일' /></td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
