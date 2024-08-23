import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function StyleManage() {
  const { no } = useParams(); // {}로 감싸야 객체 비구조화 문법으로 useParams()가 반환하는 객체에서 no라는 속성만을 추출
  const [styles, setStyles] = useState([])
  const navigate = useNavigate();

  //const [styles, setStyles] = useState([]);

  useEffect(() => {
    console.log(no);
    axios
      .get(`/admin/fashion/character/${no}`)
      .then((response) => { // 해당 배역의 스타일 정보
        setStyles(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [no]);

  return (
    <>
    <img src={show.pic} alt={`${show.title} 이미지`} />
      <table>
        <tbody>
          {actors.map((actorData, index) => (
            <tr key={index}>
              <td>{actorData.actor} ({actorData.character})</td>
              <td><img src={actorData.pic} alt={`${actorData.actor} 이미지`} /></td>
              <td><button onClick={() => navigate(`admin/fashion/character/{actorData.no}`)}>스타일 조회</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => {alert('a');}}>배우 추가</button>
    </>
  );
}
