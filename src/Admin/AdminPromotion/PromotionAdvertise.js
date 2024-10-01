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
          `/api/admin/promotion/autocomplete/${locationCategory}/${inputValue}`
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