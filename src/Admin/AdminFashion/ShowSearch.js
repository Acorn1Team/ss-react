import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"; 

export default function ShowSearch() {
    const [inputValue, setInputValue] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);  
    const [show, setShow] = useState({ title: "", pic: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const scrapShow = () => {
        setShow({no: "", title: "", pic: "" }); // 선택한 작품 초기화
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

    const addShow = () => {
        axios.post('/admin/show', show)
        .then((response) => {
            const showNo = response.data;
            setShow({ ...show, no: showNo });
            navigate(`/admin/fashion/show/${showNo}`);
        })
        .catch((error) => {
            console.log(error);
        });
    }

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
    <>
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
              {item.title} <SearchButton onMouseDown={() => {navigate(`/admin/fashion/show/${item.no}`)}}>조회</SearchButton>
            </AutoSearchItem>
          ))}
          <AutoSearchItem>
            {inputValue} <button onMouseDown={scrapShow}>네이버 웹 스크래핑</button>
            {/* onClick으로 하면 onBlur 이벤트가 먼저 트리거되므로 여기서는 onMouseDown으로 처리 */}
          </AutoSearchItem>
        </AutoSearchContainer>
      )}
    </SearchForm>
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
        <h2>[{show.title}] 작품을 추가하고 등장인물을 불러올까요?</h2>
        <img src={show.pic} alt={`${show.title} 이미지`} style={{ maxWidth: "100%", height: "auto" }} />
        <button onClick={addShow}>확인</button>
        <button onClick={() => setIsModalOpen(false)}>닫기</button>
      </Modal>
    </>
  );
}


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
  cursor: default;  // 기본 커서로 변경하여 클릭할 수 없음을 표시
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;  // 클릭 이벤트를 무시
  display: flex;
  justify-content: space-between; // 버튼과 텍스트를 양쪽 끝에 배치
  align-items: center;
  button {
    pointer-events: all;  // 버튼은 클릭할 수 있게 설정
  }
`;
