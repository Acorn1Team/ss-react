import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// 메인에서 접근
// user/main/sub/작품번호
export default function Sub() {
  // 작품 번호
  const { no } = useParams();

  // 로그인된 정보라고 가정
  const userNo = 3;

  // 전체 정보 저장용
  const [show, setShow] = useState({});
  const [characters, setCharacters] = useState([]);
  const [styles, setStyles] = useState([]);
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
        // null 일 경우 빈 배열 반환을 위해 || 사용
        setShow(res.data.show || {});
        setCharacters(res.data.characters || []);
        setStyles(res.data.styles || []);
        setItems(res.data.items || []);

        // 가지고 온 정보 중 첫 번째 배역 선택
        if (res.data.characters && res.data.characters.length > 0) {
          setSelectCharacter(res.data.characters[0]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 스크랩 여부 확인하기
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

  // 같은 작품 내 캐릭터 이동하기
  const changeCharacter = (d) => {
    // 파라미터 d 값 : 다음 캐릭터일 경우 +1, 이전 캐릭터일 경우 -1
    if (selectCharacter) {
      // 현재 선택된 캐릭터 index 찾기 (캐릭터 배열 중 현재 선택된 캐릭터와 번호가 같은 곳의 index 반환)
      const index = characters.findIndex((c) => c.no === selectCharacter.no);

      // 버튼에 따른 페이지 이동 (이동할 수 있는 최소, 최대값 벗어나지 않게 지정)
      const nextIndex =
        index + d < 0
          ? characters.length - 1
          : index + d >= characters.length
          ? 0
          : index + d;

      // 선택된 캐릭터 변경을 위한 임시 변수
      const newCharacter = characters[nextIndex];

      // 선택된 캐릭터 변경 이후 스크랩 여부 재확인
      setSelectCharacter(newCharacter);
      isScrap(newCharacter.no);
    }
  };

  // 스크랩 프로세스
  const scrapProc = () => {
    if (scrap) {
      // 스크랩이 되어 있을 경우 delete (스크랩 취소)
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
      // 스크랩이 되어 있지 않을 경우 post (스크랩)
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

  // 최초 로딩시 첫 번째 캐릭터 선택을 위한 useEffect
  useEffect(() => {
    if (characters.length > 0) {
      setSelectCharacter(characters[0]);
    }
  }, [characters]);

  // 캐릭터 변경시 scrap 업데이트를 위한 useEffect
  useEffect(() => {
    if (selectCharacter) {
      isScrap(selectCharacter.no);
    }
  }, [selectCharacter]);

  useEffect(() => {
    showSubData();
    isScrap();
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
            {scrap ? "스크랩했음" : "스크랩안했음"}
          </button>

          <div>
            {styles
              .filter((s) => s.characterNo === selectCharacter.no)
              .map((s) => (
                <div key={s.no}>
                  <h3>Style {s.no}</h3>
                  <img src={s.pic} alt={`Style ${s.no}`} />
                  {items
                    .filter((i) => s.no === i.styleNo)
                    .map((i) => (
                      <Link
                        to={`/user/shop/productList/detail/${i.no}`}
                        key={i.no}
                      >
                        <div>
                          <img src={i.pic} alt={`Item ${i.no}`} />
                        </div>
                      </Link>
                    ))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
