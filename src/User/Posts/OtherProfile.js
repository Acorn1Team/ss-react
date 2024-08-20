import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function OtherProfile() {
  const { profileUserNo } = useParams();

  const [userInfo, setUserInfo] = useState([]);
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);

  // 로그인 정보라고 가정함
  const userNo = 3;

  const getUserInfo = () => {
    axios
      .get(`/posts/user/${profileUserNo}`)
      .then((res) => setUserInfo(res.data))
      .catch((err) => {
        console.log(err);
      });
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

  const postInfo = () => {};

  const followProc = () => {
    alert("팔로우기능구현해야댐");
  };

  useEffect(() => {
    getUserInfo();
    followInfo();
  }, []);

  return (
    <div>
      {userInfo.pic}&emsp;@{userInfo.nickname}
      <br />
      {userInfo.bio}
      <button onClick={() => followProc()}>팔로우</button>
      <div>
        팔로우
        <Link
          to={`/user/style/${userNo}/followList/followee`}
          onClick={followInfo}
        >
          {followeeData.length}
        </Link>
        &emsp; 팔로워
        <Link
          to={`/user/style/${userNo}/followList/follower`}
          onClick={followInfo}
        >
          {followerData.length}
        </Link>
      </div>
      <div></div>
    </div>
  );
}
