import React, { useState } from "react";

const Main = () => {
  const [members, setMembers] = useState([]);
  const refresh = () => {
    // Ajax 요청 (Get 방식) 설정
    axios
      .get("/members")
      .then((res) => {
        // 서버로부터 응담된 데이터를 이용해 state 수정
        setMembers(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const showData = () => {};
  const showNewReview = () => {};
  const showStyleBest = () => {};
  useEffect(() => {
    refresh(); // Ajax 요청 처리
  }, []);
  return (
    <div>
      <img width="100%" src="images/mainphoto-01.png" alt="main"></img>
      <b>SceneStealer</b>
      <div className="mainTextTitle">Choose Your Scene!</div>
      <div className="mainTextTitle">New Review</div>
      <div className="mainTextTitle">Style Best</div>
    </div>
  );
};

export default Main;
