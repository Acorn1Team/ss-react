import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import styled from "styled-components";
import styles from "../Style/PromotionAdverise.module.css";
import LoadingScreen from "../../User/Component/Loading";

export default function PromotionAdvertise() {
  const navigate = useNavigate();
  const [locationCategory, setLocationCategory] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState({});
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const changeInputValue = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/admin/promotion/autocomplete/${locationCategory}/${inputValue}`
        );
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFilteredItems([]);
      }
    };
    if (locationCategory && inputValue) {
      fetchData();
    }
  }, [locationCategory, inputValue]);

  const selectPath = (item) => {

    const newPath = (locationCategory==="product") 
    ? `/user/shop/productlist/detail/${item.no}`
    : `/user/main/sub/${item.no}`;

    setState((prevState) => ({
      ...prevState,
      path: newPath,
    }));
    
    setShowDropdown(false);
    setInputValue(item.name || item.title);
  };

  const addAdvertise = () => {
    setIsLoading(true);
    axios
      .post("/admin/advertise", state)
      .then((response) => {
        if (response.data.isSuccess) {
          setIsLoading(false);
          setIsModalOpen(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>광고 알림 보내기</h2>
      <div className={styles.inputContainer}>
        <textarea
          className={styles.textarea}
          name="content"
          onChange={handleChange}
          placeholder="광고 내용을 입력하세요."
        />
        <br />
        <br />
        <form className={styles.form}>
          <select
            className={styles.select}
            onChange={(e) => setLocationCategory(e.target.value)}
            value={locationCategory}
          >
            <option value="">유도 경로 종류 선택</option>
            <option value="product">상품 페이지</option>
            <option value="show">작품 페이지</option>
          </select>

          <input
            className={styles.input}
            placeholder="어디로?"
            type="text"
            value={inputValue}
            onChange={changeInputValue}
            onBlur={() => setShowDropdown(false)}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && (
            <div className={styles.dropdown}>
              {filteredItems.map((item, index) => (
                <div
                  className={styles.dropdownItem}
                  key={index}
                  onMouseDown={() => selectPath(item)}
                >
                  {item.name || item.title}
                </div>
              ))}
            </div>
          )}
        </form>
        <input type="text" name="path" onChange={handleChange} hidden />
      </div>
      <br />
      <br />
      <button className={styles.button} onClick={addAdvertise} disabled={isLoading}>
        {isLoading ? "Loading..." : "등록"}
      </button>
      {isLoading && <LoadingScreen />}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="광고 알림 전송 완료 확인"
        style={{overlay: {backgroundColor: "rgba(0, 0, 0, 0.5)",},
                content: {
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                maxWidth: "300px",
                height: "180px",
                margin: "auto",
                },
        }}>
          <><br/>
              <h3>광고 알림 전송이 완료되었습니다!</h3>
              <button onClick={() => navigate("/admin/promotion")}>목록으로 돌아가기</button>
          </>
        </Modal>
    </div>
  );
}

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

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  position: relative; /* 드롭다운의 위치를 제대로 설정하기 위해 추가 */
`;

const SearchSelect = styled.select`
  font-family: inherit;
  font-size: inherit;
  background-color: #f4f2f2;
  border: none;
  color: #646464;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  margin-right: 0.5rem;
  transition: all ease-in-out 0.5s;
`;

const AutoSearchContainer = styled.div`
  position: absolute;
  top: calc(100% + 5px); /* 입력 필드 바로 아래에 위치하도록 설정 */
  left: 0;
  width: 30%; /* 입력 필드의 너비에 맞게 설정 */
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
