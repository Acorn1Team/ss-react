import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function StyleManage() {
  const { no } = useParams();
  const [styles, setStyles] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const actorData = location.state;

  useEffect(() => {
    axios
      .get(`/admin/fashion/character/${no}`)
      .then((response) => {
        setStyles(response.data);
        getItems(no);
      })
      .catch((error) => {
        console.log(error);
      });

    const getItems = (characterNo) => {
      axios
      .get(`/admin/fashion/character/style/${characterNo}`)
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }, [no]);

  if (!actorData) { return <p>상세 정보를 불러올 수 없습니다.</p>; }

  return (
    <>
      <div>
        <img src={actorData.pic} alt={`${actorData.character} 이미지`} />
        {actorData.character} ({actorData.actor}) 의 스타일
      </div>
      <table>
        <thead>
          <tr>
            <th>스타일</th>
            <th>아이템1</th>
            <th>아이템2</th>
            <th>아이템3</th>
          </tr>
        </thead>
        <tbody>
          {styles.map((styleData, index) => {
            // styleData.no와 일치하는 items 필터링
            const filteredItems = items.filter(item => item.style === styleData.no);

            return (
              <tr key={index}>
                <td><img src={styleData.pic} alt={`${index}번 스타일`} /></td>
                {[0, 1, 2].map((i) => (
                  <td key={i}>
                    {filteredItems[i] ? (<img src={filteredItems[i].pic} alt={`${index}번 스타일 아이템${i+1}`} />) : (<button>추가하기</button>)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

