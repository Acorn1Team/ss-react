import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ActorEditDiy() {
    const { no } = useParams(); // 스타일 PK
    const [show, setShow] = useState({ title: '', pic: '' });
    const [actors, setActors] = useState([]);
    const [scrapedDatas, setScrapedData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // 삭제 확인 모달
    const [selectedActor, setSelectedActor] = useState(null); // 선택된 actorData
    const navigate = useNavigate();

    const scrapActors = (title) => {
        axios
            .get(`/admin/scrap/actors/${title}`)
            .then((response) => {
                const updatedData = response.data
                    .map((actor) => ({
                        ...actor,
                        selected: false,
                    }));
                setScrapedData(updatedData);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => {
        getShowInfo();
    }, [no]);

    const getShowInfo = () => {
        axios
            .get(`/admin/fashion/show/${no}`)
            .then((response) => {
                setShow(response.data.show);
                setActors(response.data.actorsInfo);
                scrapActors(response.data.show.title);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const isActorRegistered = (actor) => {
        return actors.some((registeredActor) => registeredActor.actor === actor.actor);
    };

    const addCharacter = (data) => {
        axios
            .post(`/admin/show/${show.no}/character`, data)
            .then((response) => { // 추가된 캐릭터의 PK 반환
                navigate(`/admin/fashion/character/${response.data}`, { state: data }); // 배역 정보 들고 감
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const openModal = (actorData) => {
        setSelectedActor(actorData);
        setIsModalOpen(true);
    };

    const deleteCharacter = (no) => {
        axios
            .delete(`/admin/character/${no}`)
            .then(getShowInfo)
            .then(setIsModalOpen(false))
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            <h2>[{show.title}] 등장인물</h2>
            <div style={{ textAlign: 'center'}}>
                <img src={show.pic} alt={`${show.title} 이미지`} style={{ width: '200px', height: 'auto' }} />
            </div>
            <div>
                <h4>등록된 배우들</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                    {actors.map((actorData, index) => (
                        <div key={index}>
                            <img
                                src={actorData.pic}
                                alt={`${actorData.character} 이미지`}
                                style={{ display: 'block', margin: '0 auto 10px' }}
                            />
                            {actorData.actor} ({actorData.character})<br/>
                            <button onClick={() => navigate(`/admin/fashion/character/${actorData.no}`, { state: actorData })}>스타일 편집</button>
                            <button onClick={() => openModal(actorData)}>배역 제거</button>&nbsp;
                        </div>
                    ))}
                </div><hr />
                <h4>전체 배우들</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                {scrapedDatas.map((data, index) => {
                    const isRegistered = isActorRegistered(data);
                    return (
                        <div key={index} isRegistered={isRegistered}>
                            {!isRegistered && (
                            <>
                                <img src={data.pic} alt={`${data.character} 이미지`} style={{ display: 'block', margin: '0 auto 10px' }}/>
                                {data.actor} ({data.character}) &nbsp;
                                <button onClick={() => addCharacter(data)}>배역 등록</button>
                            </>
                            )}
                        </div>
                    );
                })}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="배역 삭제 확인"
                style={{
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    },
                    content: {
                        background: "white",
                        padding: "20px",
                        borderRadius: "8px",
                        textAlign: "center",
                        maxWidth: "500px",
                        height: "600px",
                        margin: "auto",
                    },
                }}
            >
                {selectedActor && (
                    <><br/>
                        <img
                            src={selectedActor.pic}
                            alt={`${selectedActor.character} 이미지`}
                            style={{ maxWidth: '70%', height: 'auto' }}
                            /><br/>
                        <h2>{selectedActor.character} ({selectedActor.actor} 배우)</h2>
                        <h3>관련 데이터를 모두 삭제할까요?</h3>
                        <button onClick={() => deleteCharacter(selectedActor.no)}>삭제</button>&nbsp;&nbsp;
                        <button onClick={() => setIsModalOpen(false)}>닫기</button>
                    </>
                )}
            </Modal>
        </>
    );
}
