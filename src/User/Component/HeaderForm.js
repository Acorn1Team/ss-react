import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

const Nav = styled.div`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  margin: 0 10px;
  text-decoration: none;
  color: white;
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

function HeaderForm() {
  return (
    <Header>
      <img
        src={leftImage}
        alt="public 폴더 이미지 읽기"
        style={{ width: 55, height: 60, marginLeft: 1 }}
      />
      <NavLink to="/user/main">HOME</NavLink>
      <NavLink to="/shop">SHOP</NavLink>
      <NavLink to="/style">STYLE</NavLink>

      <Search />
      <NavLink to="/shop/cart">
        <Icon src={cartImage} alt="Cart" />
      </NavLink>
      <NavLink to="/mypage/alert">
        <Icon src={alarmImage} alt="Alarm" />
      </NavLink>
      <NavLink to="/mypage/">
        <Icon src={profileImage} alt="Profile" />
      </NavLink>
    </Header>
  );
}

function Search() {
  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState("actor");
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (inputValue) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/${category}?term=${inputValue}`
          );
          console.log("API response:", response.data);
          setFilteredItems(response.data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching data : ", error);
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

  const clickHandler = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/user/${category}?term=${inputValue}`
      );
      setDbData(response.data);
    } catch (error) {
      console.error("Error fetching details: ", error);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <select onChange={(e) => setCategory(e.target.value)} value={category}>
        <option value="actor">배우</option>
        <option value="show">작품</option>
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
