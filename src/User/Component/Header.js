import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";

// 이미지 경로 설정
const leftImage = `${process.env.PUBLIC_URL}/images/side.png`;
const cartImage = `${process.env.PUBLIC_URL}/images/cart.png`;
const alarmImage = `${process.env.PUBLIC_URL}/images/alarm.png`;
const profileImage = `${process.env.PUBLIC_URL}/images/profile.png`;

// 기본 데이터 (자동완성을 위한 예제 데이터)
const wholeTextArray = [
  'apple',
  'banana',
  'coding',
  'javascript',
  '원티드',
  '프리온보딩',
  '프론트엔드',
];

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
  width: 50px;
  height: 45px;
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

function App() {
  return (
    <Router>
      <Header>
        <Nav>
          <img src={leftImage} alt="public 폴더 이미지 읽기" style={{ width: 55, height: 60, marginLeft: 1 }} />
          <NavLink to="/">HOME</NavLink>
          <NavLink to="/shop">SHOP</NavLink>
          <NavLink to="/style">STYLE</NavLink>
        </Nav>
        <Nav>
          <Search />
          <a href="http://www.naver.com">
            <Icon src={cartImage} alt="Cart" />
          </a>
          <a href="http://www.naver.com" style={{ margin: '0 10px' }}>
            <Icon src={alarmImage} alt="Alarm" />
          </a>
          <a href="http://www.naver.com">
            <Icon src={profileImage} alt="Profile" />
          </a>
        </Nav>
      </Header>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/style" element={<Style />} />
        </Routes>
      </div>
    </Router>
  );
}

function Search() {
  const [inputValue, setInputValue] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (inputValue) {
      const filtered = wholeTextArray.filter(item =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [inputValue]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = (item) => {
    setInputValue(item);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }}>
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
                {item}
              </AutoSearchItem>
            ))
          ) : (
            <AutoSearchItem>해당하는 단어가 없습니다</AutoSearchItem>
          )}
        </AutoSearchContainer>
      )}
    </div>
  );
}

function Home() {
  return <h1>Home</h1>;
}

function Shop() {
  return <h1>Shop</h1>;
}

function Style() {
  return <h1>Style</h1>;
}

export default App;