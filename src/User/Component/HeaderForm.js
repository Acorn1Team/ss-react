import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

// 이미지 경로 설정
const leftImage = `${process.env.PUBLIC_URL}/images/side.png`;
const cartImage = `${process.env.PUBLIC_URL}/images/cart.png`;
const alarmImage = `${process.env.PUBLIC_URL}/images/alarm.png`;
const profileImage = `${process.env.PUBLIC_URL}/images/profile.png`;

const Header = styled.header`
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;

  & > *:not(:last-child) {
    margin-right: 20px; /* 로고와 메뉴 아이템 간의 간격 설정 */
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none; /* 밑줄 제거 */
  color: black; /* 기본 글씨색 설정 */
  font-weight: bold; /* 글씨 굵게 */

  &:hover {
    color: gray; /* 마우스 오버 시 색상 변경 */
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px; /* 아이템 간의 간격 설정 */
`;

const Icon = styled.img`
  width: 30px;
  height: 25px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1); /* 마우스오버 시 요소가 커지는 효과 */
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

const SearchInput = styled.input`
  font-family: inherit;
  font-size: inherit;
  background-color: #f4f2f2;
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

const RedDot = styled.div`
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  position: absolute;
  top: -5px; /* 아이콘의 오른쪽 위로 이동 */
  right: -5px; /* 아이콘의 오른쪽 위로 이동 */
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

const AlertPopupContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 0px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 10;
  width: 300px;
  border-radius: 10px; /* 모서리 둥글게 */
  transition: all 0.3s ease-in-out; /* 애니메이션 */
`;

const AlertItem = styled.div`
  padding: 15px 10px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) =>
    props.isRead ? "#888" : "#333"}; /* 읽은 알림은 회색으로 표시 */
  background-color: ${(props) =>
    props.isRead ? "#f7f7f7" : "white"}; /* 읽은 알림의 배경색 조정 */
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) =>
      props.isRead
        ? "#e0e0e0"
        : "#f4f4f4"}; /* 읽은 알림은 더 어두운 회색 배경 */
  }

  &:last-child {
    border-bottom: none;
  }
`;

function HeaderForm() {
  const [showPopup, setShowPopup] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const hasUnreadAlerts = alerts.some((alert) => !alert.isRead);

  // 현재 페이지를 저장할 상태
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기를 저장할 상태
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수를 저장할 상태
  const [totalPages, setTotalPages] = useState(1);

  const filteredAlerts = alerts.filter(
    (alert) =>
      selectedCategory === "전체" || alert.category === selectedCategory
  );
  const navigate = useNavigate();

  // 로그인 정보라고 가정
  const userNo = 3;

  const profilePic = userNo ? `userProfilePic경로` : profileImage;

  useEffect(() => {
    // 알림 데이터 가져오기

    fetchAlerts();
    if (showAlertPopup) {
      fetchAlerts();
    }
  }, [showAlertPopup, userNo, currentPage]);

  const fetchAlerts = async () => {
    await axios
      .get(`/alert/${userNo}`, {
        params: { page: currentPage, size: pageSize },
      })
      .then((res) => {
        setAlerts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const markAsRead = async (alertNo) => {
    try {
      await axios.put(`/alert/${alertNo}`);
      fetchAlerts(); // 알림 목록을 새로 불러와서 UI 업데이트
    } catch (err) {
      console.log(err);
    }
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchAlerts(); // 이 자리에 axios로 데이터를 불러오는 함수를 입력해 줍니다.
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const deleteAlert = (alertNo) => {
    axios
      .delete(`/alert/${alertNo}`)
      .then((res) => {
        if (res.data.result) {
          fetchAlerts();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Header>
      <LeftContainer>
        <Link to="/user/main">
          <img
            src={leftImage}
            alt="public 폴더 이미지 읽기"
            style={{ width: 55, height: 60, marginLeft: 1 }}
          />
        </Link>
        <StyledLink to="/user/main">HOME</StyledLink>
        <StyledLink to="/user/shop/productlist">SHOP</StyledLink>
        <StyledLink to="/user/style">STYLE</StyledLink>
      </LeftContainer>
      <RightContainer>
        <Search />
        <Link to="/shop/cart">
          <Icon src={cartImage} alt="Cart" />
        </Link>
        <div style={{ position: "relative" }}>
          <Icon
            src={alarmImage}
            alt="Alarm"
            onClick={() => setShowAlertPopup(!showAlertPopup)}
            style={{ cursor: "pointer" }}
          />
          {hasUnreadAlerts && <RedDot />}{" "}
          {/* 확인되지 않은 알림이 있으면 빨간 점 표시 */}
        </div>
        {showAlertPopup && (
          <AlertPopupContainer>
            <div>
              <button onClick={() => setSelectedCategory("전체")}>전체</button>
              <button onClick={() => setSelectedCategory("주문")}>주문</button>
              <button onClick={() => setSelectedCategory("커뮤니티")}>
                커뮤니티
              </button>
              <button onClick={() => setSelectedCategory("프로모션")}>
                프로모션
              </button>
            </div>

            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <AlertItem
                  key={index}
                  isRead={alert.isRead}
                  onClick={() => markAsRead(alert.no)}
                >
                  <Link to={alert.path}>
                    <i style={{ fontSize: "85%" }}>{alert.category}</i>
                    <br />
                    {alert.content}
                    <br />
                    <i style={{ fontSize: "70%" }}>{formatDate(alert.date)}</i>
                  </Link>
                  <br />
                  <br />
                  <button onClick={() => deleteAlert(alert.no)}>×</button>
                </AlertItem>
              ))
            ) : (
              <div>알림 내역이 없습니다.</div>
            )}

            {totalPages > 1 && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  이전
                </button>
                <span style={{ margin: "0 10px" }}>
                  {currentPage + 1} / {totalPages}{" "}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </AlertPopupContainer>
        )}
        <Link to="/user/auth/login" onClick={() => setShowPopup(false)}>
          로그인
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
            <Link to={`/user/mypage/scrap`} onClick={() => setShowPopup(false)}>
              마이스크랩
            </Link>
            <br />
            <Link to={`/user/mypage/order`} onClick={() => setShowPopup(false)}>
              주문내역
            </Link>
            <br />
            <Link
              to={`/user/mypage/review/${userNo}`}
              onClick={() => setShowPopup(false)}
            >
              마이리뷰
            </Link>
            <br />
            <Link
              to={`/user/mypage/coupon`}
              onClick={() => setShowPopup(false)}
            >
              마이쿠폰
            </Link>
            <br />
            <Link to="/user/mypage/logout" onClick={() => setShowPopup(false)}>
              로그아웃
            </Link>
          </PopupContainer>
        )}
      </RightContainer>
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

    fetchData(); // 아래 두 값 중 하나라도 변경되면 useEffect가 실행되고, fetchData가 호출되어 그 값에 해당하는 데이터를 가져온다.
  }, [inputValue, category]); // 이 두 값 중 하나라도 변경되면 useEffect가 실행된다.

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = (item) => {
    setInputValue(item.name || item.title || item); // 먼저 input 값을 설정합니다.
    setShowDropdown(false); // 그 후 드롭다운을 닫습니다.
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100); // 드롭다운을 약간의 지연 후에 닫음
  };

  const clickHandler = (e) => {
    e.preventDefault();
    const encodedInputValue = encodeURIComponent(inputValue);
    const encodedCategory = encodeURIComponent(category);
    navigate(
      `/user/search?category=${encodedCategory}&name=${encodedInputValue}`
    );
  };

  return (
    <SearchForm>
      <SearchSelect
        onChange={(e) => setCategory(e.target.value)}
        value={category}
      >
        <option value="actor">배우</option>
        <option value="show">작품</option>
        <option value="product">상품</option>
        <option value="user">사용자</option>
      </SearchSelect>
      <SearchInput
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Search..."
      />
      <SearchButton onClick={clickHandler}>조회</SearchButton>

      {showDropdown && ( // 사용자 입력에 따라 드롭다운 목록 표시.
        // showDropdown 상태가 true일 때만 AutoSearchContainer와 그 안의 항목들이 렌더링.
        <AutoSearchContainer>
          {filteredItems.map(
            (
              item,
              index // filteredItems 배열은 사용자 입력을 기반으로 필터링된 데이터가 담겨있다.. 사용자가 입력한 내용이 포함된 항목들이...
            ) => (
              // map 메소드는 배열을 순회하면서 각 요소(item)을 AutoSearchItem이라는 컴포넌트로 변환하고 있다.
              <AutoSearchItem
                key={index}
                onMouseDown={() => handleClick(item)} // 클릭 시 호출될 함수
              >
                {item.name || item.title || item} {/* 항목의 내용 표시 */}
              </AutoSearchItem>
            )
          )}
        </AutoSearchContainer>
      )}
    </SearchForm>
  );
}

export default HeaderForm;
