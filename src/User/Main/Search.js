import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function Search() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const name = query.get("name");
  const category = query.get("category");

  const [dbData, setDbData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (name && category) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/search/`,
            {
              params: {
                category,
                term: name,
              },
            }
          );
          setDbData(response.data.results); // 서버에서 받은 결과를 설정
        } catch (error) {
          console.error("데이터 가져오기 오류:", error);
        }
      }
    };
    fetchData();
  }, [name, category]);

  return (
    <div>
      {dbData.length > 0 ? (
        <div>
          {dbData.map((item, index) => (
            <div key={index}>
              <div>Actor: {item[0]?.name || "데이터 없음"}</div>
              <div>Show: {item[1]?.title || "데이터 없음"}</div>
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
