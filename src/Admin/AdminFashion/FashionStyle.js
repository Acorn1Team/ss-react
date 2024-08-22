import axios from "axios";
import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

export default function FashionStyle() {
  const no = useParams(); // show의 PK

  const location = useLocation();
  const show = location.state.show;
  const actors = location.state.actors;

  //const [styles, setStyles] = useState([]);

  useEffect(() => {
    axios
      .get(`/admin/scrap/style/${no}`)
      .then((response) => {

      })
      .catch((error) => {
        console.log(error);
      });
  }, [no]);

  return (
    <>
      <h3>{show.title} 스타일 편집하기</h3>
      <img src={show.pic} alt={`${show.title} 이미지`} />
      <table>
        <tbody>
          {actors.map((actorData, index) => (
            <tr key={index}>
              <td>{actorData.actor} ({actorData.character})</td>
              <td><img src={actorData.pic} alt={`${actorData.actor} 이미지`} /></td>
              <td>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => {console.log('추가기기');}}>배우 추가</button>
    </>
  );
}
