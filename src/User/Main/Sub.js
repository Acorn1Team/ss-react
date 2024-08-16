import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Sub() {
  const { no } = useParams();
  const userNo = 1;

  // 전체 정보
  const [show, setShow] = useState({});
  const [characters, setCharacters] = useState([]);
  const [styles, setStyles] = useState([]);
  const [items, setItems] = useState([]);

  const [selectCharacter, setSelectCharacter] = useState(null); // 현재 선택된 캐릭터

  const [scrap, setScrap] = useState();

  const refresh = () => {
    showSubData();
    isScrap();
  };

  const showSubData = () => {
    axios
      .get(`/main/sub/${no}`)
      .then((res) => {
        setShow(res.data.show || {});
        setCharacters(res.data.characters || []); // 상태 업데이트
        setStyles(res.data.styles || []);
        setItems(res.data.items || []);

        if (res.data.characters && res.data.characters.length > 0) {
          setSelectCharacter(res.data.characters[0]); // 첫 번째 캐릭터를 선택
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
        setScrap(s.data === true); // 정확한 scrap 상태를 설정
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
      isScrap(newCharacter.no);
    }
  };

  const scrapProc = () => {
    if (scrap) {
      axios
        .delete(`/main/scrap/${selectCharacter.no}/${userNo}`)
        .then((res) => {
          // alert("스크랩 취소");
          setScrap(false);
        })
        .catch((error) => {
          console.log("스크랩 삭제 실패 :", error);
          // alert("스크랩 삭제 실패 :", error);
        });
    } else {
      axios
        .post("/main/scrap", {
          characterNo: selectCharacter.no,
          userNo: userNo,
        })
        .then((res) => {
          // alert("스크랩");
          setScrap(true);
        })
        .catch((error) => {
          console.log("스크랩 실패 :", error);
          // alert("스크랩 실패 :", error);
        });
    }
  };

  // 최초 데이터 로드 시 첫 번째 캐릭터를 선택
  useEffect(() => {
    if (characters.length > 0) {
      setSelectCharacter(characters[0]);
    }
  }, [characters]);

  useEffect(() => {
    if (selectCharacter) {
      isScrap(selectCharacter.no); // selectCharacter가 변경될 때 scrap 상태를 업데이트
    }
  }, [selectCharacter]); // selectCharacter가 변경될 때마다 실행

  useEffect(() => {
    refresh();
  }, [no]);

  return (
    <div>
      <h1>{show.title}</h1>

      <div>
        <button onClick={() => changeCharacter(-1)}>Previous Character</button>
        <button onClick={() => changeCharacter(1)}>Next Character</button>
      </div>

      {selectCharacter && (
        <div>
          <h2>{selectCharacter.name}</h2>
          <img src={selectCharacter.pic} alt={selectCharacter.name} />
          <button onClick={() => scrapProc()}>
            {scrap ? "스크랩햇음" : "스크랩안햇음"}
          </button>

          <div>
            {styles
              .filter((s) => s.characterNo === selectCharacter.no)
              .map((s) => (
                <div key={s.no}>
                  <h3>Style {s.no}</h3>
                  <img src={s.pic} alt={`Style ${s.no}`} />
                </div>
              ))}
          </div>

          <div>
            {items
              .filter((i) =>
                styles.some(
                  (s) =>
                    s.no === i.styleNo && s.characterNo === selectCharacter.no
                )
              )
              .map((i) => (
                <Link to={`/user/productDetail/${i.no}`} key={i.no}>
                  <div>
                    <img src={i.pic} alt={`Item ${i.no}`} />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
