import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FashionManage() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [show, setShow] = useState({ title: "", pic: "" });
    const [scrapedDatas, setScrapedData] = useState([]);
    const [actors, setActors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => {
        setKeyword(e.target.value);
    }

    const scrapShow = () => {
        setShow({ title: "", pic: "" }); // 선택한 작품 초기화
        axios.get(`/admin/scrap/show/${keyword}`)
            .then(response => {
                setShow(response.data);
                setIsModalOpen(true); // 모달을 열기
            })
            .catch(error => {
                console.log(error);
            });
    }

    const scrapActors = () => {
        setActors([]); // 선택한 배우 초기화
        axios.get(`/admin/scrap/actors/${keyword}`)
            .then(response => {
                setScrapedData(response.data);
            })
            .catch(error => {
                console.log(error);
            });
        document.querySelector('#keyword').value = '';
        setIsModalOpen(false); // 모달을 닫기
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

    const addMainData = () => {
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
          actor: data.actor,
          character: data.character,
          pic: data.pic
        }
        setActors((prevActors) => [...prevActors, newActor]);
    }

    return (
        <>
            작품명 검색: <input id="keyword" onChange={handleChange} type="text" name="keyword" />
            <button onClick={scrapShow}>스크래핑 시도</button>
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
                        {/* 람다 함수를 사용하면, 버튼 클릭 시에만 selectActor 함수가 호출됨 */}
                    </tr>
                )}
                </tbody>
            </table>

            {/* 모달창 구현 */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{show.title} 의 등장인물을 스크랩하겠습니다.</h2>
                        <img src={show.pic} alt={`${show.title} 이미지`} />
                        <button onClick={scrapActors}>확인</button>
                        <button onClick={() => setIsModalOpen(false)}>닫기</button>
                    </div>
                </div>
            )}
            <style jsx>{`
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }
                .modal img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </>
    );
}
