import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const [userData, setUserData] = useState([]);
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);

  // 로그인된 정보라고 가정
  const userNo = 3;

  const userInfo = () => {
    axios
      .get(`/posts/user/${userNo}`)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err));
  };

  const profileEdit = () => {
    alert("수정 어떻게 할지 고민...");
  };

  const followInfo = () => {
    axios
      .get(`/posts/user/follow/${userNo}`)
      .then((res) => {
        setFolloweeData(res.data.followeeList);
        setFollowerData(res.data.followerList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    userInfo();
    followInfo();
  }, [userNo]);

  return (
    <div style={{ backgroundColor: "lightpink" }}>
      {userData.pic}
      <br />
      {userData.nickname}
      <br />
      <button onClick={() => profileEdit()}>수정</button>
      <div>
        팔로우
        <Link
          to={`/user/style/post/${userNo}/followList/followee`}
          onClick={followInfo}
        >
          {followeeData.length}
        </Link>
        &emsp; 팔로워
        <Link
          to={`/user/style/post/${userNo}/followList/follower`}
          onClick={followInfo}
        >
          {followerData.length}
        </Link>
      </div>
    </div>
  );
}
