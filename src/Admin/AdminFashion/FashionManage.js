import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"; 

// Search 컴포넌트
function Search({ inputValue, setInputValue, scrapShow, navigate }) {
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);  

  useEffect(() => {
    const fetchData = async () => {
      if (inputValue) {
        try {
          const response = await axios.get(`/admin/show/autocomplete/${inputValue}`);
          setFilteredItems(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFilteredItems([]);
        }
      } else {
        // 입력값 없을 때는 전체 목록을 가져온다.
        try {
          const response = await axios.get('/admin/show/autocomplete');
          setFilteredItems(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFilteredItems([]);
        }
      }
    };
    fetchData();
  }, [inputValue]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  return (
    <SearchForm>
      <SearchInput
        id="inputValue"
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => setShowDropdown(true)}
        name="inputValue"
      />

      {showDropdown && (
        <AutoSearchContainer>
          {filteredItems.map((item, index) => (
            <AutoSearchItem key={index}>
              {item.title} <SearchButton onClick={() => {navigate(`/admin/fashion/show/${encodeURIComponent(item.title)}`)}}>조회</SearchButton>
            </AutoSearchItem>
          ))}
          <AutoSearchItem>
            {inputValue} <button onMouseDown={scrapShow}>네이버 웹 스크래핑</button>
            {/* onMouseDown 이벤트로 설정해야, onMouseDown: 마우스를 눌렀을 때 (포커스가 바뀌기 전)
                onBlur: 입력 필드 등에서 포커스를 잃었을 때 (onMouseDown 후에 발생)
                onClick: 마우스를 눌렀다 뗄 때 (실제 클릭이 완료되었을 때) 
                결론) onClick으로 하면 onBlur 이벤트가 먼저 트리거되므로 여기서는 onMouseDown으로 처리
            */}
          </AutoSearchItem>
        </AutoSearchContainer>
      )}
    </SearchForm>
  );
}

export default function FashionManage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(""); // inputValue 상태 관리
  const [show, setShow] = useState({ title: "", pic: "" });
  const [scrapedDatas, setScrapedData] = useState([]);
  const [actors, setActors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const scrapShow = () => {
    setShow({ title: "", pic: "" }); // 선택한 작품 초기화
    axios
      .get(`/admin/scrap/show/${inputValue}`)
      .then((response) => {
        setShow(response.data);
        setIsModalOpen(true); // 모달 열기
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const scrapActors = () => {
    setActors([]); // 선택한 배우 초기화
    axios
      .get(`/admin/scrap/actors/${inputValue}`)
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
    document.querySelector("#inputValue").value = "";
    setIsModalOpen(false); // 모달을 닫기
  };

  const selectActor = (data, index) => {
    const updatedScrapedDatas = [...scrapedDatas];
    updatedScrapedDatas[index].selected = !updatedScrapedDatas[index].selected;

    if (updatedScrapedDatas[index].selected) {
      const newActor = {
        actor: data.actor,
        character: data.character,
        pic: data.pic,
      };
      setActors((prevActors) => [...prevActors, newActor]);
    } else {
      setActors((prevActors) =>
        prevActors.filter(
          (actor) => actor.actor !== data.actor || actor.character !== data.character
        )
      );
    }

    setScrapedData(updatedScrapedDatas);
  };

  return (
    <>
      <Search
        inputValue={inputValue}
        setInputValue={setInputValue}
        setShow={setShow}
        setIsModalOpen={setIsModalOpen}
        scrapShow={scrapShow}
        navigate={navigate}
      />
      <hr />
      <SelectedActors 
        actors={actors}
        show={show}
        navigate={navigate}
      />
      <hr />
      <Table>
        <tbody>
          {scrapedDatas.map((data, index) => (
            <tr key={index}>
              <td>{data.actor}</td>
              <td>({data.character})</td>
              <td>
                <img src={data.pic} alt={`${data.actor} 이미지`} />
              </td>
              <td>
                <button onClick={() => selectActor(data, index)}>
                  {data.selected ? "선택 취소" : "선택"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 모달창 구현 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="작품 정보"
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
            margin: "auto",
          },
        }}
      >
        <h2>{show.title} 의 등장인물을 스크랩하겠습니다.</h2>
        <img
          src={show.pic}
          alt={`${show.title} 이미지`}
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <button onClick={scrapActors}>확인</button>
        <button onClick={() => setIsModalOpen(false)}>닫기</button>
      </Modal>
    </>
  );
}

const SelectedActors = ({ actors, show, navigate }) => {

  const addMainData = () => {
    axios
      .post("/admin/fashion", {
        actors: actors,
        show: show
      })
      .then((response) => { // 추가된 작품의 PK 반환
        navigate(`/admin/fashion/${response.data}`, { state: { show, actors } });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div>선택 목록</div>
      <Table>
        <tbody>
          {actors.map((actorData, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{actorData.actor}</td>
              <td>({actorData.character})</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <button onClick={addMainData}>작품 & 배우 추가</button>
    </>
  );
};


// Styled-components
const SearchForm = styled.form`
  display: flex;
  align-items: center;
  position: relative; /* 드롭다운의 위치를 제대로 설정하기 위해 추가 */
`;

const SearchInput = styled.input`
  font-family: inherit;
  font-size: inherit;
  background-color: white;
  border: none;
  color: #646464;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  width: 12em;
  transition: all ease-in-out 0.5s;
  margin-right: 0.5rem;

  &:hover,
  &:focus {
    box-shadow: 0 0 1em #00000013;
  }

  &:focus {
    outline: none;
    background-color: #f0eeee;
  }

  &::-webkit-input-placeholder {
    font-weight: 100;
    color: #ccc;
  }
`;

const SearchButton = styled.button`
  font-family: inherit;
  font-size: inherit;
  background-color: #323232;
  color: #fff;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #505050;
    cursor: pointer;
  }
`;

const AutoSearchContainer = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  width: 400px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 10px 10px rgb(0, 0, 0, 0.3);
  z-index: 3;
`;

const AutoSearchItem = styled.div`
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  &:hover {
    background-color: #edf5f5;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  td,
  th {
    padding: 8px;
    border: 1px solid #ddd;
  }

  img {
    max-width: 100px;
    height: auto;
  }
`;