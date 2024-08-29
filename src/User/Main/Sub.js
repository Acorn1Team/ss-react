import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import styles from "../Style/Sub.module.css"; // CSS 모듈 임포트

export default function Sub() {
  const { no } = useParams();
  const locationState = useLocation();

  // 로그인된 정보라고 가정
  const userNo = 3;

  // 전체 정보 저장용
  const [show, setShow] = useState({});
  const [characters, setCharacters] = useState([]);
  const [styleData, setStyleData] = useState([]); // 이름을 styleData로 변경
  const [styleItems, setStyleItems] = useState([]);
  const [items, setItems] = useState([]);

  // 현재 선택된 캐릭터에 대한 정보 저장용
  const [selectCharacter, setSelectCharacter] = useState(null);

  // 스크랩 여부 저장용
  const [scrap, setScrap] = useState();

  // 현재 작품에 대한 모든 정보 가져오기
  const showSubData = () => {
    axios
      .get(`/main/sub/${no}`)
      .then((res) => {
        setShow(res.data.show || {});
        setCharacters(res.data.characters || []);
        setStyleData(res.data.styles || []); // 여기도 styleData로 변경
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
    if (scrap) {
      axios
        .delete(`/main/scrap/${selectCharacter.no}/${userNo}`)
        .then((res) => {
          if (res.data.result === true) {
            setScrap(false);
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
          }
        })
        .catch((error) => {
          console.log("스크랩 실패 :", error);
        });
    }
  };

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
        <button
          className={styles.characterBtn}
          onClick={() => changeCharacter(-1)}
        >
          이전캐릭터
        </button>
        <button
          className={styles.characterBtn}
          onClick={() => changeCharacter(1)}
        >
          다음캐릭터
        </button>
      </div>

      {selectCharacter && (
        <div className={styles.characterDetails}>
          <h2 className={styles.characterName}>{selectCharacter.name}</h2>
          <img
            className={styles.characterImg}
            src={selectCharacter.pic}
            alt={selectCharacter.name}
          />
          <button className={styles.scrapBtn} onClick={() => scrapProc()}>
            {scrap ? "스크랩했음" : "스크랩안했음"}
          </button>

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
                          <Link
                            to={`/user/shop/productList/detail/${i.no}`}
                            key={i.no}
                            className={styles.productLink}
                          >
                            <div>
                              <img src={i.pic} alt={`Item ${i.no}`} />
                            </div>
                          </Link>
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
