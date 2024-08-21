import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

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
          console.log("Fetched data:", response.data.results); // 콘솔 로그 추가
          setDbData(response.data.results || []); // 서버에서 받은 결과를 설정
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
            <div key={index}>
              {/* 카테고리에 따라 다른 내용을 렌더링 */}
              {category === "actor" && (
                <div>
                  <div>
                    Actor:{" "}
                    {item.actorNames
                      ? item.actorNames.join(", ")
                      : "데이터 없음"}
                  </div>
                  <div>Age: {item.age || "데이터 없음"}</div>
                  <div>
                    Movies:{" "}
                    {item.movies ? item.movies.join(", ") : "데이터 없음"}
                  </div>
                </div>
              )}
              {category === "show" && (
                <div>
                  <div>Show Title: {item.title || "데이터 없음"}</div>
                  <div>
                    Cast:{" "}
                    {item.actorNames
                      ? item.actorNames.join(", ")
                      : "데이터 없음"}
                  </div>
                </div>
              )}
              {category === "product" && (
                <div>
                  <div>Product Name: {item.name || "데이터 없음"}</div>
                  <div>Price: {item.price || "데이터 없음"}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>데이터 없음</div>
      )}
    </div>
  );
}

export default Search;
