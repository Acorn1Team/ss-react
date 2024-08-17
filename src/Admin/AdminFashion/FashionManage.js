import { useState } from "react";
import axios from "axios";
import AdminTop from "../AdminTop";

export default function FashionManage() {
    const [keyword, setKeyword] = useState("");
    const [showset, setShowset] = useState([]);
    const [actors, setActors] = useState([]);

    const handleChange = (e) => {
        setKeyword(e.target.value);
    }

    const doScrap = () => {
        axios.get(`/admin/scrap/${keyword}`)
            .then(response => {
                setShowset(response.data);
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
                <input type="text" value={keyword} />
                <button>작품명 확정 & 선택 완료</button>
            </>
        )
    }

    const addActor = (actor, character) => {
    
        const newActor = {
          actor:actor,
          character:character
        }
    
        setActors((prevActors) => [...prevActors, newActor]);
      }

    return (
        <>
            <AdminTop></AdminTop>
            작품명 검색: <input id="keyword" onChange={handleChange} type="text" name="keyword" />
            <button onClick={doScrap}>스크래핑 시도</button>
            <hr/>
            <SelectedActors actors={actors} />
            <hr/>
            <table>
                <tbody>
                {showset.map((data, index) =>
                    <tr key={index}>
                        <td>{data.actor}</td>
                        <td>({data.character})</td>
                        <td><button onClick={() => addActor(data.actor, data.character)}>선택</button></td>
                        {/* 람다 함수를 사용하면, 버튼 클릭 시에만 addActor 함수가 호출됨 */}
                    </tr>
                )}
                </tbody>
            </table>
        </>
    );
}