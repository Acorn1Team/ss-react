import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../Style/Sub.module.css";

import "./Sub.css";
import {
  PiCaretCircleDoubleLeftFill,
  PiCaretCircleDoubleRightFill,
} from "react-icons/pi";
export default function Sub() {
  const { no } = useParams();
  const locationState = useLocation();
  const nv = useNavigate();

  // 로그인된 정보라고 가정
  const userNo = sessionStorage.getItem("id");

  // 전체 정보 저장용
  const [show, setShow] = useState({});
  const [characters, setCharacters] = useState([]);
  const [styleData, setStyleData] = useState([]);
  const [styleItems, setStyleItems] = useState([]);
  const [items, setItems] = useState([]);

  // 현재 선택된 캐릭터에 대한 정보 저장용
  const [selectCharacter, setSelectCharacter] = useState(null);

  // 스크랩 여부 저장용
  const [scrap, setScrap] = useState();

  // 마우스 오버된 아이템 저장용
  const [hoveredItem, setHoveredItem] = useState(null);

  // 현재 작품에 대한 모든 정보 가져오기
  const showSubData = () => {
    axios
      .get(`/main/sub/${no}`)
      .then((res) => {
        setShow(res.data.show || {});
        setCharacters(res.data.characters || []);
        setStyleData(res.data.styles || []);
        setStyleItems(res.data.styleItems || []);
        setItems(res.data.items || []);

        const searchSelect = locationState.state?.stateValue;
        if (searchSelect) {
          setSelectCharacter(searchSelect);
        } else if (res.data.characters && res.data.characters.length > 0) {
          setSelectCharacter(res.data.characters[0]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const isScrap = (characterNo) => {
    axios
      .get(`/main/like/${characterNo}/${userNo}`)
      .then((s) => {
        setScrap(s.data === true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const changeCharacter = (d) => {
    if (selectCharacter) {
      const index = characters.findIndex((c) => c.no === selectCharacter.no);
      const nextIndex =
        index + d < 0
          ? characters.length - 1
          : index + d >= characters.length
          ? 0
          : index + d;
      const newCharacter = characters[nextIndex];

      setSelectCharacter(newCharacter);
    }
  };

  const scrapProc = () => {
    if (userNo) {
      if (scrap) {
        axios
          .delete(`/main/scrap/${selectCharacter.no}/${userNo}`)
          .then((res) => {
            if (res.data.result === true) {
              setScrap(false);
              // 스크랩 수 감소 반영
              setSelectCharacter((prevCharacter) => ({
                ...prevCharacter,
                characterLikeNo:
                  prevCharacter.characterLikeNo &&
                  prevCharacter.characterLikeNo > 0
                    ? prevCharacter.characterLikeNo - 1
                    : 0, // 최소 값은 0으로 설정
              }));
            }
          })
          .catch((error) => {
            console.log("스크랩 삭제 실패 :", error);
          });
      } else {
        axios
          .post("/main/scrap", {
            characterNo: selectCharacter.no,
            userNo: userNo,
          })
          .then((res) => {
            if (res.data.result === true) {
              setScrap(true);
              // 스크랩 수 증가 반영
              setSelectCharacter((prevCharacter) => ({
                ...prevCharacter,
                characterLikeNo: prevCharacter.characterLikeNo
                  ? parseInt(prevCharacter.characterLikeNo) + 1
                  : 1, // 처음 스크랩일 경우 1로 설정
              }));
            }
          })
          .catch((error) => {
            console.log("스크랩 실패 :", error);
          });
      }
    } else {
      nv("../../auth/login");
    }
  };

  // 캐릭터가 바뀔 때마다 스크랩 여부를 가져옴
  useEffect(() => {
    if (selectCharacter) {
      isScrap(selectCharacter.no); // 스크랩 여부 확인
    }
  }, [selectCharacter]);

  useEffect(() => {
    showSubData();
  }, [no]);

  useEffect(() => {
    if (selectCharacter) {
      isScrap(selectCharacter.no);
    }
  }, [selectCharacter]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{show.title}</h1>

      <div className={styles.characterNavigation}>
        <span className="movePage" onClick={() => changeCharacter(-1)}>
          <PiCaretCircleDoubleLeftFill size={50} color="df919e" />
        </span>

        <span onClick={() => changeCharacter(1)}>
          <PiCaretCircleDoubleRightFill size={50} color="df919e" />
        </span>
      </div>

      {selectCharacter && (
        <div className={styles.characterDetails}>
          <h2 className={styles.characterName}>{selectCharacter.name}</h2>
          <img
            className={styles.characterImg}
            src={selectCharacter.pic}
            alt={selectCharacter.name}
          />

          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              className="ui-bookmark"
              onClick={() => scrapProc()}
              style={{ display: "flex", alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={scrap}
                onChange={scrapProc} // 좋아요 처리 함수
                style={{ display: "none" }} // 체크박스 숨김
              />
              <div className="bookmark" style={{ marginRight: "10px" }}>
                {" "}
                {/* 하트와 텍스트 사이 간격 */}
                <svg
                  viewBox="0 0 16 16"
                  height="25" // 하트 크기 유지
                  width="25" // 하트 크기 유지
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
            </span>

            <span>
              {selectCharacter.characterLikeNo !== null &&
              selectCharacter.characterLikeNo !== undefined
                ? selectCharacter.characterLikeNo > 0
                  ? `${selectCharacter.characterLikeNo} 명이 좋아합니다!`
                  : "하트를 눌러 스크랩해 보세요." // 스크랩 수가 0인 경우
                : "하트를 눌러 스크랩해 보세요."}
            </span>
          </div>

          <div className={styles.styles}>
            {styleData
              .filter((s) => s.characterNo === selectCharacter.no)
              .map((s) => (
                <div className={styles.styleItem} key={s.no}>
                  <h3>Style {s.no}</h3>
                  <img
                    className={styles.styleImg}
                    src={s.pic}
                    alt={`Style ${s.no}`}
                  />
                  {styleItems
                    .filter((si) => si.styleNo === s.no)
                    .map((si) =>
                      items
                        .filter((i) => si.itemNo === i.no)
                        .map((i) => (
                          <div
                            className={styles.productLink}
                            onMouseEnter={() => setHoveredItem(i.no)}
                            onMouseLeave={() => setHoveredItem(null)}
                            key={i.no}
                          >
                            <img src={i.pic} alt={`Item ${i.no}`} />
                            {hoveredItem === i.no && (
                              <div className={styles.hoverOverlay}>
                                <Link
                                  to={`/user/shop/productList/detail/${i.productNo}`}
                                  style={{ fontSize: "60%", color: "#444" }}
                                >
                                  해당 상품 보러 가기
                                  <br />
                                  (외부 사이트 이동)
                                </Link>
                                <Link
                                  style={{ fontSize: "60%", color: "#444" }}
                                  to={`/user/shop/productList/detail/${i.productNo}`}
                                >
                                  SceneStealer에서 <br />
                                  유사한 상품 구경하기
                                </Link>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
