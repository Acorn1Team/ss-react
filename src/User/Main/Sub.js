import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Sub() {
  const { no } = useParams();

  // 전체 정보
  const [show, setShow] = useState({});
  const [characters, setCharacters] = useState([]);
  const [styles, setStyles] = useState([]);
  const [items, setItems] = useState([]);

  const [selectCharacter, setSelectCharacter] = useState(null); // 현재 선택된 캐릭터
  const [selectCharacterStyle, setSelectCharacterStyle] = useState([]); // 현재 선택된 캐릭터의 스타일 리스트
  const [selectCharacterStyleItem, setSelectCharacterStyleItem] = useState([]); // 현재 선택된 스타일의 아이템 리스트

  const refresh = () => {
    showSubData();
  };

  const showSubData = () => {
    axios
      .get(`/main/sub/${no}`)
      .then((res) => {
        setShow(res.data.show || []);
        setCharacters(res.data.characters || []); // 상태 업데이트
        setStyles(res.data.styles || []);
        setItems(res.data.items || []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 캐릭터가 변경될 때마다 해당 캐릭터의 스타일과 첫 번째 스타일의 아이템을 설정
  useEffect(() => {
    if (selectCharacter) {
      const stylesForCharacter = styles.filter(
        (style) => style.characterNo === selectCharacter.no
      );
      setSelectCharacterStyle(stylesForCharacter);

      if (stylesForCharacter.length > 0) {
        const itemsForFirstStyle = items.filter(
          (item) => item.styleNo === stylesForCharacter[0].no
        );
        setSelectCharacterStyleItem(itemsForFirstStyle);
      } else {
        setSelectCharacterStyleItem([]); // 스타일이 없으면 아이템도 빈 배열로 설정
      }
    }
  }, [selectCharacter, styles, items]);

  // 스타일 변경에 따른 아이템 변경
  const handleStyleChange = (styleNo) => {
    const itemsForStyle = items.filter((item) => item.styleNo === styleNo);
    setSelectCharacterStyleItem(itemsForStyle);
  };

  // 캐릭터 변경 함수
  const changeCharacter = (direction) => {
    const currentIndex = characters.findIndex(
      (c) => c.no === selectCharacter.no
    );
    const nextIndex =
      (currentIndex + direction + characters.length) % characters.length;
    setSelectCharacter(characters[nextIndex]);
  };

  // 최초 데이터 로드 시 첫 번째 캐릭터를 선택
  useEffect(() => {
    if (characters.length > 0) {
      setSelectCharacter(characters[0]);
    }
  }, [characters]);

  useEffect(() => {
    refresh();
  }, [no]);

  return (
    <div>
      {show.title}
      <div>
        <button onClick={() => changeCharacter(-1)}>Previous Character</button>
        <button onClick={() => changeCharacter(1)}>Next Character</button>
      </div>

      {selectCharacter && (
        <div>
          <h2>{selectCharacter.name}</h2>
          <img src={selectCharacter.pic} alt={selectCharacter.name} />
        </div>
      )}

      <div>
        {selectCharacterStyle.map((style) => (
          <div key={style.no} onClick={() => handleStyleChange(style.no)}>
            <img src={style.pic} alt={`Style ${style.no}`} />
          </div>
        ))}
      </div>

      <div>
        {selectCharacterStyleItem.map((item) => (
          <div key={item.no}>
            <img src={item.pic} alt={`Item ${item.no}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
