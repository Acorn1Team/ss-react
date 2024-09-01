import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom"; // 현재 URL의 위치를 확인하고, 페이지 이동을 위한 링크를 import합니다.
import axios from "axios";
import styles from "../Style/ActorProfile.module.css"; // 배우 프로필 관련 스타일을 import합니다.
import styles2 from "../Style/SearchUser.module.css"; // 사용자 검색 관련 스타일을 import합니다.

function Search() {
  const location = useLocation(); // 현재 URL의 위치 정보 가져오기
  const query = new URLSearchParams(location.search); // URL의 쿼리 파라미터 추출
  const name = query.get("name"); // "name" 쿼리 파라미터 값 가져오기
  const category = query.get("category"); // "category" 쿼리 파라미터 값 가져오기

  // 상태 변수들
  const [dbData, setDbData] = useState([]); // 서버에서 가져온 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태를 나타내는 변수
  const [error, setError] = useState(null); // 에러 메시지를 저장할 상태
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(5); // 한 페이지에 표시할 데이터 항목 수
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수

  useEffect(() => {
    // 데이터 요청과 상태 업데이트를 처리하는 비동기 함수
    const fetchData = async () => {
      setLoading(true); // 데이터 요청 시작 시 로딩 상태로 설정
      setError(null); // 에러 상태 초기화

      if (name && category) {
        // "name"과 "category"가 있을 때만 데이터 요청
        try {
          const response = await axios.get(
            `http://localhost:8080/user/search/${category}/${name}`, // 데이터 요청 URL
            {
              params: {
                page: currentPage, // 요청할 페이지 번호
                size: pageSize, // 페이지당 데이터 항목 수
                searchTerm: name, // 검색어
                searchField: category, // 검색 카테고리
              },
            }
          );

          if (response.data) {
            setTotalPages(response.data.totalPages); // 서버 응답에서 총 페이지 수 업데이트
            setDbData(response.data.results || []); // 서버 응답에서 데이터 업데이트
          }
        } catch (error) {
          console.error("Error fetching data:", error.message); // 콘솔에 에러 메시지 출력
          setError("An error occurred while fetching data."); // 사용자에게 에러 메시지 표시
        } finally {
          setLoading(false); // 데이터 요청 완료 후 로딩 상태 종료
        }
      } else {
        setLoading(false); // 쿼리 파라미터가 없을 때도 로딩 상태 종료
      }
    };

    fetchData(); // 데이터 요청 함수 호출
  }, [name, category, currentPage, pageSize]); // 의존성 배열: 이 값들이 변경될 때마다 데이터 요청

  useEffect(() => {
    // 검색어가 변경될 때마다 현재 페이지를 0으로 리셋
    setCurrentPage(0);
  }, [name, category]); // 검색어와 카테고리가 변경될 때마다 실행

  const handlePageChange = (newPage) => {
    // 페이지 변경 함수
    if (newPage >= 0 && newPage < totalPages) {
      // 유효한 페이지 번호일 때만 상태 업데이트
      setCurrentPage(newPage); // 현재 페이지 번호를 새 페이지로 변경
    }
  };

  if (loading) {
    return <div>Loading...</div>; // 데이터 로딩 중일 때 화면에 표시
  }

  if (error) {
    return <div>{error}</div>; // 에러 발생 시 에러 메시지 화면에 표시
  }

  return (
    <div>
      {dbData.length > 0 ? (
        <div>
          {dbData.map((item, index) => (
            <span key={index}>
              {/* 카테고리에 따라 적절한 아이템 컴포넌트를 렌더링 */}
              {category === "actor" && <ActorItem item={item} />}
              {category === "show" && <ShowItem item={item} />}
              {category === "product" && <ProductItem item={item} />}
              {category === "user" && <UserItem item={item} />}
            </span>
          ))}
        </div>
      ) : (
        <div>검색 결과가 없습니다.</div> // 데이터가 없을 때 표시
      )}
      <div>
        {totalPages > 1 && (
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)} // 이전 페이지 버튼 클릭 시 페이지 변경
              disabled={currentPage === 0 || loading} // 첫 페이지이거나 로딩 중일 때 비활성화
              className={`${styles2.pagingButton} ${styles2.customBtn}`}
            >
              이전
            </button>
            <span style={{ margin: "0 10px" }}>
              {currentPage + 1} / {totalPages}{" "}
              {/* 현재 페이지와 총 페이지 수 표시 */}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)} // 다음 페이지 버튼 클릭 시 페이지 변경
              disabled={currentPage + 1 >= totalPages || loading} // 마지막 페이지이거나 로딩 중일 때 비활성화
              className={`${styles2.pagingButton} ${styles2.customBtn}`}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActorItem({ item }) {
  return (
    <div className={styles.actorsContainer}>
      <span className={styles.profileContainer}>
        <span>
          <Link to={`/user/main/sub/${item.no}`}>
            <img
              src={item.showDetails[1]} // 배우의 사진 URL
              alt={`배우 사진`} // 이미지 설명
              className={styles.profilePic} // 스타일 적용
            />
          </Link>
        </span>
        <span className={styles.actorName}>
          <Link to={`/user/main/sub/${item.no}`}>{item.showDetails[0]}</Link>{" "}
          {/* 배우 이름 링크 */}
        </span>
      </span>
    </div>
  );
}

// 쇼 아이템 컴포넌트
function ShowItem({ item }) {
  return (
    <div className={styles.profileContainer}>
      <span className={styles.actorsContainer}>
        <Link to={`/user/main/sub/${item.no}`} state={{ stateValue: item }}>
          <img
            src={item.pic} // 쇼의 사진 URL
            alt={`${item.name}`} // 이미지 설명
            className={styles.profilePic} // 스타일 적용
          />
        </Link>
      </span>
      <span className={styles.actorName}>
        <Link to={`/user/main/sub/${item.showNo}`} state={{ stateValue: item }}>
          {item.name}
        </Link>{" "}
        {/* 쇼 제목 링크 */}
      </span>
    </div>
  );
}

// 제품 아이템 컴포넌트
function ProductItem({ item }) {
  return (
    <div>
      <div>
        <Link to={`/user/shop/productlist/detail/${item.no}`}>
          Product Name: {item.name || "No data"} {/* 제품 이름 링크 */}
        </Link>
      </div>
      <div>
        Price: {item.price || "No data"} {/* 제품 가격 표시 */}
      </div>
    </div>
  );
}

// 사용자 아이템 컴포넌트
function UserItem({ item }) {
  return (
    <div className={styles2.profileContainer}>
      <img
        src={item.pic} // 사용자 사진 URL
        alt={`${item.name}'s picture`} // 이미지 설명
        className={styles2.profilePic} // 스타일 적용
      />
      <div className={styles2.profileInfo}>
        <Link
          to={`/user/style/profile/${item.no}`}
          style={{ textDecoration: "none", color: "inherit" }} // 링크 스타일 초기화
        >
          <div className={styles2.profileId}>{item.id || "No data"}</div>{" "}
          {/* 사용자 ID 표시 */}
        </Link>
        <div className={styles2.profileNickname}>{item.nickname}</div>{" "}
        {/* 사용자 닉네임 표시 */}
      </div>
    </div>
  );
}

export default Search;
