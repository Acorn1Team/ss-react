import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ActorEdit() {
    const { no } = useParams(); // 스타일 PK
    const [show, setShow] = useState({ title: '', pic: '' });
    const [actors, setActors] = useState([]);
    const [scrapedDatas, setScrapedData] = useState([]);
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

    const deleteCharacter = (no) => {
        axios
            .delete(`/admin/character/${no}`)
            .then(getShowInfo)
            .catch((error) => {
                console.log(error);
        });
    }

    return (
        <>
            <h2>[{show.title}] 등장인물</h2>
            <img src={show.pic} alt={`${show.title} 이미지`} />
            <div>
                <h4>등록된 배우들</h4>
                {actors.map((actorData, index) => (
                    <div key={index}>
                        <img src={actorData.pic} alt={`${actorData.character} 이미지`} />
                        {actorData.actor} ({actorData.character})
                        <button onClick={() => deleteCharacter(actorData.no)}>배역 정보 전체 삭제하기</button>&nbsp;
                        <button onClick={() => navigate(`/admin/fashion/character/${actorData.no}`, { state: actorData })}>스타일 편집</button>
                    </div>
                ))}
            </div>
            <hr />
            <div>
                <h4>전체 배우들</h4>
                {scrapedDatas.map((data, index) => {
                    const isRegistered = isActorRegistered(data);
                    return (
                        <div key={index} isRegistered={isRegistered}>
                            <img src={data.pic} alt={`${data.character} 이미지`} />
                            {data.actor} ({data.character})
                            {!isRegistered && (
                                <button onClick={() => addCharacter(data)}>
                                    추가하기
                                </button>
                            )}
                            {isRegistered && (
                                <button disabled>
                                    이미 추가되었습니다.
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
