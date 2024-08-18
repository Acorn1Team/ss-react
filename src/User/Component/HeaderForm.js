import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

// 이미지 경로 설정
const leftImage = `${process.env.PUBLIC_URL}/images/side.png`;
const cartImage = `${process.env.PUBLIC_URL}/images/cart.png`;
const alarmImage = `${process.env.PUBLIC_URL}/images/alarm.png`;
const profileImage = `${process.env.PUBLIC_URL}/images/profile.png`;

const Header = styled.header`
  background-color: gray;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const Icon = styled.img`
  width: 30px;
  height: 25px;
`;

const SearchInput = styled.input`
  margin-right: 10px;
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

const PopupContainer = styled.div`
  position: absolute;
  top: 50px;
  right: 10px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 10;
  width: 150px;
`;

function HeaderForm() {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // 로그인 정보라고 가정
  const userNo = 3;

  const profilePic = userNo ? `userProfilePic경로` : profileImage;

  // 로그인 여부에 따른 상호작용 컨트롤용 함수
  const handleProfileClick = () => {
    if (userNo) {
      // 로그인 정보가 있으면 팝업 띄우기
      setShowPopup(!showPopup);
    } else {
      // 로그인 정보가 없으면 로그인창으로 이동하기
      navigate("/login");
    }
  };

  return (
    <Header>
      <img
        src={leftImage}
        alt="public 폴더 이미지 읽기"
        style={{ width: 55, height: 60, marginLeft: 1 }}
      />
      <Link to="/user/main">HOME</Link>
      <Link to="/user/shop/productlist">SHOP</Link>
      <Link to="/user/style/post">STYLE</Link>

      <Search />
      <Link to="/shop/cart">
        <Icon src={cartImage} alt="Cart" />
      </Link>
      <Link to="/mypage/alert">
        <Icon src={alarmImage} alt="Alarm" />
      </Link>
      <Icon
        src={profileImage}
        alt="Profile"
        onClick={() => setShowPopup(!showPopup)}
        style={{ cursor: "pointer" }}
      />
      {showPopup && (
        <PopupContainer>
          <Link to="/user/mypage/profile" onClick={() => setShowPopup(false)}>
            프로필
          </Link>
          <br />
          <Link
            to={`/user/mypage/scrap/${userNo}`}
            onClick={() => setShowPopup(false)}
          >
            마이스크랩
          </Link>
          <br />
          <Link to="/user/mypage/logout" onClick={() => setShowPopup(false)}>
            로그아웃
          </Link>
        </PopupContainer>
      )}
    </Header>
  );
}

function Search() {
  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState("actor");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (inputValue) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/search/${category}?term=${inputValue}`
          );
          if (Array.isArray(response.data)) {
            setFilteredItems(response.data);
          } else {
            console.error("Unexpected response data format");
          }
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFilteredItems([]);
        }
      } else {
        setShowDropdown(false);
      }
    };

    fetchData();
  }, [inputValue, category]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = (item) => {
    setInputValue(item.name || item.title || item);
    setShowDropdown(false);
  };

  const clickHandler = () => {
    const encodedInputValue = encodeURIComponent(inputValue);
    const encodedCategory = encodeURIComponent(category);
    navigate(`/search?category=${encodedCategory}&name=${encodedInputValue}`);
  };

  return (
    <div style={{ position: "relative" }}>
      <select onChange={(e) => setCategory(e.target.value)} value={category}>
        <option value="actor">배우</option>
        <option value="show">작품</option>
        <option value="product">상품</option>
      </select>
      <SearchInput
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Search..."
      />
      {showDropdown && (
        <AutoSearchContainer>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <AutoSearchItem key={index} onClick={() => handleClick(item)}>
                {item.name || item.title || "Unknown"}
              </AutoSearchItem>
            ))
          ) : (
            <AutoSearchItem>해당하는 단어가 없습니다</AutoSearchItem>
          )}
        </AutoSearchContainer>
      )}
      <button onClick={clickHandler}>조회</button>
    </div>
  );
}

export default HeaderForm;
