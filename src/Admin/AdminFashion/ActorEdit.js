import axios from "axios";
import Modal from "react-modal";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ActorEdit() {
    const { no } = useParams(); // 스타일 PK
    const [show, setShow] = useState({ title: '', pic: '' });
    const [actors, setActors] = useState([]);
    const [scrapedDatas, setScrapedData] = useState([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // 삭제 확인 모달
    const [selectedActor, setSelectedActor] = useState(null); // 선택된 actorData

    const [actorName, setActorName] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [file, setFile] = useState(null);

    const scrapActors = (title) => {
        axios
            .get(`/admin/scrap/actors/${title}`)
            .then((response) => {
                const updatedData = response.data.map((actor) => ({
                    ...actor,
                    selected: false,
                }));
                setScrapedData(updatedData);
            })
            .catch((error) => {
                console.log(error);
            });
    };

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
    };

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
    };

    // 직접 추가 시
    const addCharacterDIY = () => {
        const form = new FormData();
        form.append('actorName', actorName);
        form.append('characterName', characterName);
        form.append('file', file);

        axios
            .post(`/admin/show/${show.no}/character/diy`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((response) => {
                navigate(`/admin/fashion/character/${response.data.no}`, { state: response.data });
            })
            .catch((error) => {
                console.log(error);
            });
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

    const openModal = (actorData) => {
        setSelectedActor(actorData);
        setIsModalOpen(true);
    };

    return (
        <>
            <h2>[{show.title}]</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '20%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <img src={show.pic} alt={`${show.title} 이미지`} style={{ width: '70%', height: 'auto' }} />
                    </div>
                </div>

                {actors.length > 0 && (
                    <div style={{ width: '80%' }}>
                        <h4>등록된 배우들</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {actors.map((actorData, index) => (
                                <div key={index} style={{ textAlign: 'center' }}>
                                    <img
                                        src={actorData.pic}
                                        alt={`${actorData.character} 이미지`}
                                        style={{ height: '220px', display: 'block', margin: '0 auto' }}
                                    />
                                    {actorData.actor} ({actorData.character})<br />
                                    <button onClick={() => navigate(`/admin/fashion/character/${actorData.no}`, { state: actorData })}>
                                        스타일 편집
                                    </button><br />
                                    <button onClick={() => openModal(actorData)}>배역 제거</button>&nbsp;
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <hr />
            {scrapedDatas.length > 0 ? (
                <div>
                    <h4>등록되지 않은 배우들</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {scrapedDatas.map((data, index) => {
                            const isRegistered = isActorRegistered(data);
                            return (
                                <div key={index} isRegistered={isRegistered}>
                                    {!isRegistered && (
                                        <>
                                            <img src={data.pic} alt={`${data.character} 이미지`} style={{ height: '220px', display: 'block' }} />
                                            <button onClick={() => addCharacter(data)}>배역 등록</button><br />
                                            {data.actor}<br />({data.character})
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <>
                    <h3>직접 추가해주세요.</h3>
                    <label>배우명:</label>
                    <input onChange={(e) => setActorName(e.target.value)} type="text" name="title" /><br />
                    <label>배역명:</label>
                    <input onChange={(e) => setCharacterName(e.target.value)} type="text" name="title" placeholder="작품명 입력하기" />역<br />
                    <label>이미지:</label>
                    <input onChange={(e) => setFile(e.target.files[0])} type="file" name="pic" accept="image/*" /><br /><br />
                    <button onClick={addCharacterDIY}>추가</button>
                </>
            )}

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
