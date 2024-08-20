import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FashionManage() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [scrapedDatas, setScrapedData] = useState([]);
    const [actors, setActors] = useState([]);

    const handleChange = (e) => {
        setKeyword(e.target.value);
    }

    const doScrap = () => {
        setActors([]); // 선택한 배우 초기화
        axios.get(`/admin/scrap/${keyword}`)
            .then(response => {
                setScrapedData(response.data);
            })
            .catch(error => {
                console.log(error);
            });
        document.querySelector('#keyword').value = '';
    }

    const SelectedActors = ({ actors }) => {
        return(
            <>
                <div>선택 목록</div>
                <table><tbody>
                    {actors.map((actorData, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{actorData.actor}</td>
                            <td>({actorData.character})</td>
                        </tr>
                    ))}
                </tbody></table>
                <button onClick={addMainData}>작품명 확정 & 선택 완료</button>
            </>
        )
    }

    const addMainData = ({ actors }) => {
        axios.post('/admin/fashion', actors)
            .then(response => {
                navigate(`/admin/fashion/${response.data.no}`)
            })
            .catch(error => {
                console.log(error);
            });
    }

    const selectActor = (data) => {
        const newActor = {
          actor:data.actor,
          character:data.character,
          pic:data.pic
        }
        setActors((prevActors) => [...prevActors, newActor]);
      }

    return (
        <>
            작품명 검색: <input id="keyword" onChange={handleChange} type="text" name="keyword" />
            <button onClick={doScrap}>스크래핑 시도</button>
            <hr/>
            <SelectedActors actors={actors} />
            <hr/>
            <table>
                <tbody>
                {scrapedDatas.map((data, index) =>
                    <tr key={index}>
                        <td>{data.actor}</td>
                        <td>({data.character})</td>
                        <td><img src={data.pic} alt="{data.actor} 이미지"/></td>
                        <td><button onClick={() => selectActor(data)}>선택</button></td>
                        {/* 람다 함수를 사용하면, 버튼 클릭 시에만 addActor 함수가 호출됨 */}
                    </tr>
                )}
                </tbody>
            </table>
        </>
    );
}