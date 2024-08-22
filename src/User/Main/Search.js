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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (name && category) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/search/${category}/${name}`
          );
          setDbData(response.data.results || []);
        } catch (error) {
          console.error("데이터 가져오기 오류:", error.message);
          setError("데이터를 가져오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, category]);

  if (loading) {
    return <div>로딩 중...</div>;
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
        <div>데이터 없음</div>
      )}
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
              src={item.pic}
              alt={`${item.name}의 사진`}
              className={styles.profilePic}
            />
          </Link>
        </span>
        <span className={styles.actorName}>
          <Link to={`/user/main/sub/${item.no}`}>{item.title}</Link>
        </span>
      </span>
    </div>
  );
}

function ShowItem({ item }) {
  return (
    <div className={styles.profileContainer}>
      <span className={styles.actorsContainer}>
        <Link to={`/user/main/sub/${item.no}`}>
          <img
            src={item.pic}
            alt={`${item.name}의 사진`}
            className={styles.profilePic}
          />
        </Link>
      </span>
      <span className={styles.actorName}>
        <Link to={`/user/main/sub/${item.no}`}>{item.title}</Link>
      </span>
    </div>
  );
}

function ProductItem({ item }) {
  return (
    <div>
      <div>
        <Link to={`/user/shop/productlist/detail/${item.no}`}>
          Product Name: {item.name || "데이터 없음"}
        </Link>
      </div>
      <div>Price: {item.price || "데이터 없음"}</div>
    </div>
  );
}

function UserItem({ item }) {
  return (
    <div className={styles2.profileContainer}>
      <img
        src={item.pic}
        alt={`${item.name}의 사진`}
        className={styles2.profilePic}
      />
      <div className={styles2.profileInfo}>
        <Link
          to={`/user/style/profile/${item.no}`}
          style={{ textDecoration: "none", color: "inherit" }} // 링크 스타일 초기화
        >
          <div className={styles2.profileId}>{item.id || "데이터 없음"}</div>
        </Link>
        <div className={styles2.profileNickname}>{item.nickname}</div>
      </div>
    </div>
  );
}
export default Search;
