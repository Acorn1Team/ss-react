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
  const [alerts, setAlerts] = useState([]); // 기본값을 빈 배열로 설정
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoggedIn, setIsLoggedIn] = useState(true); // 로그인 여부 상태

  const checkFor = () => {
    const userId = sessionStorage.getItem("id");
    if (userId) {
      setIsLoggedIn(true);
      // 프로필 이미지나 기타 사용자 정보 업데이트 로직 추가 가능
    } else {
      setIsLoggedIn(false);
      navigate("/user/auth/login");
    }
  };

  const handleProfileClick = () => {
    checkFor();
    if (isLoggedIn) {
      setShowPopup(!showPopup);
    }
  };

  const handleLogout = () => {
    let kakaoTokenValue = sessionStorage.getItem("token_k");
    if (kakaoTokenValue) {
      axios
        .post(
          `https://kapi.kakao.com/v1/user/logout`,
          {
            target_id_type: "user_id",
            target_id: sessionStorage.getItem("id"),
          },
          {
            headers: {
              Authorization: `Bearer ${kakaoTokenValue}`,
            },
          }
        )
        .then((res) => {
          if (res.data) {
            console.log(res.data);
            navigate("/user");
          }
        })
        .catch((err) => {
          console.log(err);
        });
      sessionStorage.removeItem("token_k");
    }
    let naverTokenValue = sessionStorage.getItem("token_n");
    if (naverTokenValue) {
      sessionStorage.removeItem("token_n");
    }
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/user/auth/login");
  };

  const filteredAlerts = alerts.filter(
    (alert) =>
      selectedCategory === "전체" || alert.category === selectedCategory
  );

  const handleAlarmClick = () => {
    setShowAlertPopup(!showAlertPopup);
    setShowPopup(false); // 알림 클릭 시 프로필 팝업을 닫음
  };

  const navigate = useNavigate();
  const userNo = sessionStorage.getItem("id"); // 로그인 정보라고 가정
  // const profilePic = userNo ? `userProfilePic경로` : profileImage;

  // 알림 데이터가 없거나 유효하지 않은 경우를 처리합니다.
  const hasUnreadAlerts = alerts && alerts.some((alert) => !alert.isRead);

  useEffect(() => {
    fetchAlerts();
    if (showAlertPopup) {
      fetchAlerts();
    }
  }, [showAlertPopup, userNo, currentPage]);

  const fetchAlerts = async () => {
    if (userNo) {
      try {
        const response = await axios.get(`/alert/${userNo}`, {
          params: { page: currentPage, size: pageSize },
        });
        setAlerts(response.data.content || []); // 데이터가 없을 경우 빈 배열로 설정
        setTotalPages(response.data.totalPages || 1); // 총 페이지 수가 없을 경우 1로 설정
      } catch (err) {
        console.log(err);
        setAlerts([]); // 에러 발생 시 알림 데이터를 빈 배열로 설정
      }
    }
  };

  const markAsRead = async (alertNo) => {
    try {
      await axios.put(`/alert/${alertNo}`);
      fetchAlerts(); // 알림 목록을 새로 불러와서 UI 업데이트
    } catch (err) {
      console.log(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const deleteAlert = async (alertNo) => {
    try {
      const response = await axios.delete(`/alert/${alertNo}`);
      if (response.data.result) {
        fetchAlerts();
      }
    } catch (err) {
      console.log(err);
    }
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
        <Link to="/user/shop/cart">
          <Icon src={cartImage} alt="Cart" />
        </Link>
        {userNo && (
          <div style={{ position: "relative" }}>
            <Icon
              src={alarmImage}
              alt="Alarm"
              onClick={handleAlarmClick}
              style={{ cursor: "pointer" }}
            />
            {hasUnreadAlerts && <RedDot />}{" "}
            {/* 확인되지 않은 알림이 있으면 빨간 점 표시 */}
          </div>
        )}
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
                  key={alert.no || index}
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
        {isLoggedIn ? (
          <>
            <Icon
              src={profileImage}
              alt="프로필"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            />
            {showPopup && (
              <PopupContainer>
                <Link
                  to={`/user/mypage/update/${userNo}`}
                  onClick={() => setShowPopup(false)}
                >
                  회원정보수정
                </Link>
                <br />
                <Link
                  to="/user/mypage/scrap"
                  onClick={() => setShowPopup(false)}
                >
                  마이스크랩
                </Link>
                <br />
                <Link
                  to="/user/mypage/order"
                  onClick={() => setShowPopup(false)}
                >
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
                  to="/user/mypage/coupon"
                  onClick={() => setShowPopup(false)}
                >
                  마이쿠폰
                </Link>
                <br />
                <button onClick={handleLogout}>로그아웃</button>
              </PopupContainer>
            )}
          </>
        ) : (
          <Icon
            src={profileImage}
            alt="로그인"
            onClick={() => checkFor()}
            style={{ cursor: "pointer" }}
          />
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
            setFilteredItems([]);
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

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
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

      {showDropdown && (
        <AutoSearchContainer>
          {filteredItems.map((item, index) => (
            <AutoSearchItem key={index} onMouseDown={() => handleClick(item)}>
              {item.name || item.title || item}
            </AutoSearchItem>
          ))}
        </AutoSearchContainer>
      )}
    </SearchForm>
  );
}

export default HeaderForm;
