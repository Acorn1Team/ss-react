import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function Search() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const name = query.get("name");
  const category = query.get("category");

  const [dbData, setDbData] = useState(null);

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
          console.log("서버 응답:", response.data); // 응답 데이터 확인
          setDbData(response.data);
        } catch (error) {
          console.error("데이터 가져오기 오류:", error);
        }
      } else {
        console.error("name 또는 category가 정의되지 않았습니다.");
      }
    };
    fetchData();
  }, [name, category]);

  return (
    <div>
      {dbData ? (
        <div>
          <div>{dbData.data?.no || "데이터 없음"}</div>
          <div>{dbData.data?.name || "데이터 없음"}</div>
          <div>{dbData.data?.title || "데이터 없음"}</div>
        </div>
      ) : (
        <div>데이터 없음</div>
      )}
    </div>
  );
}

export default Search;
