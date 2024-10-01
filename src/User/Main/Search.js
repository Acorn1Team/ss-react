import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import styles from "../Style/SearchResults.module.css";

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
    setCurrentPage(0);  // 검색어가 바뀔 때 페이지를 0으로 초기화
  }, [name, category]);

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      if (name && category) {
        try {
          const validPage = Math.max(currentPage, 0); // 페이지 계산 수정
          const response = await axios.get(`/api/user/search/${category}/${name}`, {
            params: {
              page: validPage,
              size: pageSize,
            },
          });
  
          if (response.data) {
            setTotalPages(response.data.totalPages); // 총 페이지 수 설정
            setDbData(response.data.results || []);
          }
        } catch (error) {
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
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  function Pagination({ totalPages, currentPage, handlePageChange }) {
    // totalPages가 1보다 크면 페이징 버튼을 보여줌
    if (totalPages <= 1) {
      return null; // totalPages가 1이하일 때는 아무것도 렌더링하지 않음
    }
  
    return (
      <div className={styles.paginationContainer}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={styles.paginationButton}
        >
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage + 1 >= totalPages}
          className={styles.paginationButton}
        >
          다음
        </button>
      </div>
    );
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.searchContainer}>
      {dbData.length > 0 ? (
        dbData.map((item, index) => (
          <div key={index} className={styles.cardContainer}>
            {category === "actor" && <ActorItem item={item} />}
            {category === "show" && <ShowItem item={item} />}
            {category === "product" && <ProductItem item={item} />}
            {category === "user" && <UserItem item={item} />}
          </div>
        ))
      ) : (
        <div>검색 결과가 없습니다.</div>
      )}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </div>
  );
}

function ActorItem({ item }) {
  const showDetails = item.showDetails || [];
  const showNo = showDetails[0] || "Unknown No";
  const actorName = showDetails[1] || "No Name";
  const actorPic = showDetails[2] || "defaultProfilePic.png";

  return (
    <div className={styles.actorCardContainer}>
      <Link to={`/user/main/sub/${showNo}`} className={styles.actorCard}>
        <div className={styles.actorCardTitle}>👁‍🗨 {item.name} 출연작</div>
        <img src={actorPic} alt={`배우 사진`} className={styles.actorImage} />
      </Link>
    </div>
  );
}

// function ActorItem({ item }) {
//   const showDetails = item.showDetails || [];
//   const showNo = showDetails[0] || "Unknown No";
//   const actorName = showDetails[1] || "No Name";
//   const actorPic = showDetails[2] || "defaultProfilePic.png";

//   return (
//     <Link to={`/user/main/sub/${showNo}`}>
//       <div className={styles.cardTitle}>{item.name || "No Name"} 출연작</div>
//             <img
//               src={actorPic}
//               alt={`배우 사진`}
//               // className={styles.profilePic}
//             />
//           </Link>
//   );
// }

// function ActorItem({ item }) {
//   return (
//     <Link to={`/user/main/sub/${item.no}`} className={styles.cardLink}>
//       <img
//         src={item.pic || "defaultProfilePic.png"}
//         alt="배우 사진"
//         className={styles.cardImage}
//       />
//       <div className={styles.cardTitle}>{item.name || "No Name"}</div>
//     </Link>
//   );
// }

function ShowItem({ item }) {
  return (
    <Link to={`/user/main/sub/${item.showNo}`} className={styles.cardLink}>
      <img
        src={item.pic || "defaultShowPic.png"}
        alt="작품 사진"
        className={styles.cardImage}
      />
      <div className={styles.cardTitle}>{item.name || "No Name"}</div>
    </Link>
  );
}

// 가격에 쉼표 추가하는 함수
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ProductItem({ item }) {
  return (
    <Link
      to={`/user/shop/productlist/detail/${item.no}`}
      className={styles.cardLink}
    >
      <img
        src={item.pic || "defaultShowPic.png"}
        alt="상품 사진"
        className={styles.productImage}
      />
      <div className={styles.productDetails}>
        <div className={styles.productName}>{item.name || "No data"}</div>
        <div className={styles.productPrice}>
          {item.price ? `${formatPrice(item.price)} 원` : "No data"}
        </div>
      </div>
    </Link>
  );
}

function UserItem({ item }) {
  return (
    <div className="userItemContainer">
      <Link to={`/user/style/profile/${item.no}`} className={styles.userLink}>
        <img
          src={item.pic || "defaultUserPic.png"}
          alt="사용자 사진"
          className={styles.profileImage}
        />
        <div className={styles.userTextContainer}>
          <div className={styles.userTitle}>@{item.nickname}</div>
          <div className={styles.userBio}>{item.bio}</div>
        </div>
      </Link>
    </div>
  );
}

function Pagination({ totalPages, currentPage, handlePageChange }) {
  return (
    <div className={styles.paginationContainer}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={styles.paginationButton}
      >
        이전
      </button>
      <span>
        {currentPage + 1} / {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage + 1 >= totalPages}
        className={styles.paginationButton}
      >
        다음
      </button>
    </div>
  );
}

export default Search;
