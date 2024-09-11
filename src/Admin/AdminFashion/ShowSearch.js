import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ItemManage from "./ItemManage";

export default function ShowSearch() {
  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [show, setShow] = useState({ title: "", pic: "" });
  const [isModalOpen, setIsModalOpen] = useState(false); // 작품 정보 웹 스크래핑 성공 시
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false); // 작품 정보 웹 스크래핑 실패 시
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const scrapShow = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    setShowDropdown(false);
    console.log("스크래핑 시작");
    setShow({ no: "", title: "", pic: "" }); // 선택한 작품 초기화
    await axios
      .get(`/admin/scrap/show/${inputValue}`)
      .then((response) => {
        if (response.data.pic !== null) {
          setShow(response.data);
          setIsModalOpen(true);
        } else {
          setIsSecondModalOpen(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const addShow = () => {
    axios
      .post("/admin/show", show)
      .then((response) => {
        const showNo = response.data;
        setShow({ ...show, no: showNo });
        navigate(`/admin/fashion/show/${showNo}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (inputValue) {
        try {
          const response = await axios.get(
            `/admin/show/autocomplete/${inputValue}`
          );
          setFilteredItems(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFilteredItems([]);
        }
      } else {
        // 입력값 없을 때는 전체 목록을 가져온다.
        try {
          const response = await axios.get("/admin/show/autocomplete");
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

  // 직접 추가 시
  const addShowDIY = () => {
    const showForm = new FormData();
    showForm.append("title", title);
    showForm.append("file", file);

    axios
      .post("/admin/show/diy", showForm, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        const showNo = response.data;
        setShow({ ...show, no: showNo });
        navigate(`/admin/fashion/show/${showNo}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Container>
        <LeftSection>
          <h2>패션 정보 관리</h2>
          <SearchForm>
            <SearchInput
              id="inputValue"
              type="text"
              value={inputValue}
              onChange={handleChange}
              onFocus={() => setShowDropdown(true)}
              name="inputValue"
              placeholder="작품명을 입력하세요"
            />

            {showDropdown && (
              <AutoSearchContainer>
                {filteredItems.map((item, index) => (
                  <AutoSearchItem key={index}>
                    {item.title}{" "}
                    <SearchButton
                      onClick={() => {
                        navigate(`/admin/fashion/show/${item.no}`);
                      }}
                    >
                      조회
                    </SearchButton>
                  </AutoSearchItem>
                ))}
                <AutoSearchItem>
                  {inputValue}{" "}
                  <SearchButtonN onClick={scrapShow}>정보 찾기</SearchButtonN>
                </AutoSearchItem>
              </AutoSearchContainer>
            )}
          </SearchForm>
        </LeftSection>

        <Divider />

        <RightSection>
          <h2>등록된 아이템 관리</h2>
          <ItemManage />
        </RightSection>
      </Container>

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
            height:"600px",
            margin: "auto",
          },
        }}
      >
        <h2>[{show.title}] 정보 불러오기 성공!</h2>
        <img
          src={show.pic}
          alt={`${show.title} 이미지`}
          style={{ maxWidth: "100%", height: "auto" }}
        /><br/>
        <h3>작품을 추가하고 등장인물을 불러올까요?</h3>
        <button onClick={() => setIsModalOpen(false)}>취소</button>&nbsp;&nbsp;
        <button onClick={addShow}>확인</button>
      </Modal>

      <Modal
        isOpen={isSecondModalOpen}
        onRequestClose={() => setIsSecondModalOpen(false)}
        contentLabel="작품 정보 없을 때"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "600px",
            margin: "auto",
          },
        }}
      >
        <h1>작품 [{inputValue}]의 정보 찾기 실패 🥲</h1>
        <h3>직접 추가하거나, 검색을 다시 시도하세요.</h3>
        <hr />
        <h2>직접 추가하기</h2>
        <label>작품명:</label>
        <input
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          name="title"
          placeholder="작품명 입력하기"
        />
        <br />
        <label>이미지:</label>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          name="pic"
          accept="image/*"
        />
        <br />
        <br />
        <button onClick={addShowDIY}>추가</button>
        <br />
        <hr />
        <button onClick={() => setIsSecondModalOpen(false)}>
          다시 검색할게요
        </button>
      </Modal>
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
`;

const LeftSection = styled.div`
  width: 50%; /* 왼쪽 섹션 너비 */
`;

const RightSection = styled.div`
  width: 50%; /* 오른쪽 섹션 너비 */
`;

const Divider = styled.div`
  width: 1px;
  background-color: #ccc;
  height: 500px; /* 고정 높이 설정 */
  margin: 0 20px;
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SearchInput = styled.input`
  font-family: inherit;
  font-size: inherit;
  background-color: rgb(199, 199, 199);
  border: none;
  color: black;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  margin-bottom: 10px;

  &:hover,
  &:focus {
    box-shadow: 0 0 1em #00000013;
  }

  &:focus {
    outline: none;
    background-color: #f0eeee;
  }
`;

const AutoSearchContainer = styled.div`
  width: 100%;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
  margin-top: 10px;
`;

const AutoSearchItem = styled.div`
  padding: 10px;
  cursor: default;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    cursor: pointer;
  }
`;

const SearchButton = styled.button`
  background-color: gray;
  color: white;
  padding: 0.7rem 1rem;
  border-radius: 30px;

  &:hover {
    background-color: #505050;
    cursor: pointer;
  }
`;

const SearchButtonN = styled(SearchButton)`
  background-color: #323232;
`;