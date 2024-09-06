import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ActorEdit() {
    const { no } = useParams(); // 스타일 PK
    const [show, setShow] = useState({ title: '', pic: '' });
    const [actors, setActors] = useState([]);
    const [scrapedDatas, setScrapedData] = useState([]);
    const navigate = useNavigate();

    const [actorName, setActorName] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [file, setFile] = useState(null);

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

    // 직접 추가 시
    const addCharacterDIY = () => {
        const form = new FormData();
        form.append('actorName', actorName);
        form.append('characterName', characterName);
        form.append('file', file);

        axios.post(`/admin/show/${show.no}/character/diy`, form, {
            headers: { 'Content-Type': 'multipart/form-data'}
        })
        .then((response) => { // 추가된 캐릭터 Dto 반환
            navigate(`/admin/fashion/character/${response.data.no}`, { state: response.data }); // 배역 정보 들고 감
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
            <h2>[{show.title}]</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* 왼쪽: 작품 정보 */}
            <div style={{ width: '20%' }}>
                <div style={{ textAlign: 'center' }}>
                    <img src={show.pic} alt={`${show.title} 이미지`} style={{ width: '70%', height: 'auto' }} />
                </div>
            </div>

            {/* 오른쪽: 등록된 배우들 */}
            {actors.length > 0 && (
                <div style={{ width: '80%' }}>
                    <h4>등록된 배우들</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                        {actors.map((actorData, index) => (
                            <div key={index} style={{ textAlign: 'center'}}>
                                <img
                                    src={actorData.pic}
                                    alt={`${actorData.character} 이미지`}
                                    style={{ height: '220px', display: 'block', margin: '0 auto' }}
                                />
                                {actorData.actor} ({actorData.character})<br />
                                <button onClick={() => navigate(`/admin/fashion/character/${actorData.no}`, { state: actorData })}>스타일 편집</button><br />
                                <button onClick={() => deleteCharacter(actorData.no)}>배역 제거</button>&nbsp;
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
                <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                {scrapedDatas.map((data, index) => {
                    const isRegistered = isActorRegistered(data);
                    return (
                        <div key={index} isRegistered={isRegistered}>
                            {!isRegistered && (
                            <>
                                <img src={data.pic} alt={`${data.character} 이미지`} style={{ height:'220px', display: 'block'}}/>
                                <button onClick={() => addCharacter(data)}>배역 등록</button><br/>
                                {data.actor}<br/>({data.character})
                            </>
                            )}
                        </div>
                    );
                })}
                </div>
            </div>
            )
            : (
                <>
                    <h3>직접 추가해주세요.</h3>
                    <label>배우명:</label>
                    <input onChange={(e)=> setActorName(e.target.value)} type="text" name="title"/><br/>
                    <label>배역명:</label>
                    <input onChange={(e)=> setCharacterName(e.target.value)} type="text" name="title" placeholder="작품명 입력하기" />역<br/>
                    <label>이미지:</label>
                    <input onChange={(e)=> setFile(e.target.files[0])} type="file" name="pic" accept="image/*" /><br/><br/>
                    <button onClick={addCharacterDIY}>추가</button>
                </>
            )}
        </>
    );
}
