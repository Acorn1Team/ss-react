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
  const [scrap, setScrap] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);

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

  const updateScrapInfo = (characterNo) => {
    // 스크랩 여부 확인
    isScrap(characterNo);

    // 스크랩 수 확인
    axios
      .get(`/main/scrap/count/${characterNo}`) // 이 API는 캐릭터의 스크랩 수를 반환한다고 가정
      .then((res) => {
        console.log(res.data); // 데이터 구조 확인을 위해 콘솔 출력
        setScrapCount(res.data.likesCount || 0);
      })
      .catch((error) => {
        console.log("스크랩 수 조회 실패 :", error);
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

  // 캐릭터 변경 함수에서 스크랩 정보도 업데이트
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
      updateScrapInfo(newCharacter.no); // 캐릭터 변경 시 스크랩 정보 업데이트
    }
  };

  const scrapProc = () => {
    if (userNo) {
      if (scrap) {
        axios
          .delete(`/main/scrap/${selectCharacter.no}/${userNo}`)
          .then((res) => {
            if (res.data.result === true) {
              setScrap(false); // 스크랩 취소 후 상태 업데이트
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
              setScrap(true); // 스크랩 후 상태 업데이트
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

  // 컴포넌트 첫 로드 시 스크랩 정보도 업데이트
  useEffect(() => {
    if (selectCharacter) {
      updateScrapInfo(selectCharacter.no);
    }
  }, [selectCharacter]);

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <h1 className={styles.showTitle}>{show.title}</h1>
        {selectCharacter && (
          <>
            <h2 className={styles.characterTitle}>{selectCharacter.name}</h2>
            <div className={styles.characterImgWrapper}>
              <img
                className={styles.characterImg}
                src={selectCharacter.pic}
                alt={selectCharacter.name}
              />
            </div>
            <div className={styles.characterNav}>
              <span className="movePage" onClick={() => changeCharacter(-1)}>
                <PiCaretCircleDoubleLeftFill size={50} color="df919e" />
              </span>
              <span onClick={() => changeCharacter(1)}>
                <PiCaretCircleDoubleRightFill size={50} color="df919e" />
              </span>
            </div>

            <div className={styles.scrapSection}>
              <span className={styles.uiBookmark} onClick={() => scrapProc()}>
                <input
                  type="checkbox"
                  checked={scrap}
                  onChange={scrapProc}
                  style={{ display: "none" }} // 체크박스 숨김
                />
                <div
                  className={styles.bookmark}
                  style={{ marginRight: "10px" }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    height="25"
                    width="25"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </span>

              <span className={styles.scrapCount}>
                {scrapCount > 0
                  ? `${scrapCount} 명이 좋아합니다!`
                  : "하트를 눌러 스크랩해 보세요."}
              </span>
              <hr />
              <div style={{ fontSize: "80%", color: "gray" }}>
                {selectCharacter.name}의 스타일이 마음에 드신다면,
                <br /> 해당하는 제품의 판매처로 이동하거나
                <br /> SceneStealer 에서 유사 상품을 <br />
                구매할 수 있어요!
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.rightSection}>
        {styleData
          .filter((s) => s.characterNo === selectCharacter.no)
          .map((s) => (
            <div className={styles.styleBox} key={s.no}>
              <div className={styles.styleItemsWrapper}>
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
                              <Link className="btn1Small" to={i.path}>
                                해당 상품 보러 가기
                                <br /> (외부 사이트 이동)
                              </Link>
                              <Link
                                className="btn1Small"
                                to={`/user/shop/productList/detail/${i.productNo}`}
                              >
                                SceneStealer 에서
                                <br /> 유사한 상품 보러 가기
                              </Link>
                            </div>
                          )}
                        </div>
                      ))
                  )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
