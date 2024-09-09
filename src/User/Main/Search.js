import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import styles from "../Style/ActorProfile.module.css";
import styles2 from "../Style/SearchUser.module.css";

function Search() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const name = query.get("name");
  const category = query.get("category");

  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (name && category) {
        try {
          const validPage = Math.max(currentPage - 1, 0); // 페이지 인덱스가 0보다 작지 않도록 설정
          console.log("Fetching page:", validPage); // 페이지 값 확인

          const response = await axios.get(
            `http://localhost:8080/user/search/${category}/${name}`,
            {
              params: {
                page: validPage,
                size: pageSize,
                // searchTerm: name,
                // searchField: category,
              },
            }
          );

          console.log("API Response:", response.data); // API 응답 데이터 확인

          if (response.data) {
            setTotalPages(response.data.totalPages);
            setDbData(response.data.results || []);
          }
        } catch (error) {
          console.error("Error fetching data:", error.message);
          setError("An error occurred while fetching data.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, category, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
    setTotalPages(1); // 검색 조건이 변경되면 페이지 총수도 초기화
  }, [name, category]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {dbData.length > 0 ? (
        <div>
          {dbData.map((item, index) => (
            <span key={index}>
              {category === "actor" && <ActorItem item={item} />}
              {category === "show" && <ShowItem item={item} />}
              {category === "product" && <ProductItem item={item} />}
              {category === "user" && <UserItem item={item} />}
            </span>
          ))}
        </div>
      ) : (
        <div>검색 결과가 없습니다.</div>
      )}
      <div>
        {totalPages > 1 && (
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => handlePageChange(currentPage)}
              disabled={currentPage === 0 || loading}
              className={`${styles2.pagingButton} ${styles2.customBtn}`}
            >
              이전
            </button>
            <span style={{ margin: "0 10px" }}>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage + 1 >= totalPages || loading}
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
  const showDetails = item.showDetails || [];
  const showNo = showDetails[0] || "Unknown No";
  const actorName = showDetails[1] || "No Name";
  const actorPic = showDetails[2] || "defaultProfilePic.png";

  return (
    <div className={styles.actorsContainer}>
      <span className={styles.profileContainer}>
        <span>
          <Link to={`/user/main/sub/${showNo}`}>
            <img
              src={actorPic}
              alt={`배우 사진`}
              className={styles.profilePic}
            />
          </Link>
        </span>
        <span className={styles.actorName}>
          <Link to={`/user/main/sub/${item.no}`}>{actorName}</Link>
        </span>
      </span>
    </div>
  );
}

function ShowItem({ item }) {
  return (
    <div className={styles.profileContainer}>
      <span className={styles.actorsContainer}>
        <Link to={`/user/main/sub/${item.showNo}`} state={{ stateValue: item }}>
          <img
            src={item.pic || "defaultShowPic.png"} // 기본 이미지 설정
            alt={`${item.name}`}
            className={styles.profilePic}
          />
        </Link>
      </span>
      <span className={styles.actorName}>
        <Link to={`/user/main/sub/${item.showNo}`} state={{ stateValue: item }}>
          {item.name || "No Name"}
        </Link>
      </span>
    </div>
  );
}

function ProductItem({ item }) {
  return (
    <div>
      <div>
        <Link to={`/user/shop/productlist/detail/${item.no}`}>
          Product Name: {item.name || "No data"}
        </Link>
      </div>
      <div>Price: {item.price || "No data"}</div>
    </div>
  );
}

function UserItem({ item }) {
  return (
    <div className={styles2.profileContainer}>
      <img
        src={item.pic || "defaultUserPic.png"} // 기본 이미지 설정
        alt={`${item.name}`}
        className={styles2.profilePic}
      />
      <div className={styles2.profileInfo}>
        <Link
          to={`/user/style/profile/${item.no}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className={styles2.profileId}>{item.id || "No data"}</div>
        </Link>
        <div className={styles2.profileNickname}>
          {item.nickname || "No data"}
        </div>
      </div>
    </div>
  );
}

export default Search;
