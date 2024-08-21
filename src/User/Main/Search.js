import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import styles from "../Style/ActorProfile.module.css";

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
    <span>
      <span>
        <Link to={`/user/main/sub/${item.no}`}>
          <img src={item.pic} alt={`${item.name}의 사진`} />
        </Link>
      </span>
      <span>
        <Link to={`/user/main/sub/${item.no}`}>{item.title}</Link>
      </span>
    </span>
  );
}

function ShowItem({ item }) {
  const { actorNames = [], actorPics = [], showActorsNo = [] } = item;

  return (
    <div className={styles.actorsContainer}>
      {actorNames.length > 0 ? (
        actorNames.map((actorName, idx) => (
          <span
            key={showActorsNo[idx] || idx}
            className={styles.actorContainer}
          >
            <Link
              to={`/user/main/sub/${showActorsNo[idx]}`}
              className={styles.link} // 스타일 클래스 추가
            >
              <div className={styles.profileContainer}>
                <img
                  className={styles.profilePic}
                  src={actorPics[idx]}
                  alt={`${actorName}의 사진`} // 접근성을 위해 적절한 alt 속성을 설정하세요.
                />
                <span className={styles.actorName}>{actorName}</span>
              </div>
            </Link>
          </span>
        ))
      ) : (
        <div>배우 정보 없음</div>
      )}
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

export default Search;
