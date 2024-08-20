import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const [userData, setUserData] = useState([]);
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // 로그인된 정보라고 가정
  const userNo = 3;

  const userInfo = () => {
    axios
      .get(`/posts/user/${userNo}`)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err));
  };

  const profileEdit = (action) => {
    if (action === "save") {
      axios
        .put(`/posts/user/${userNo}`, {
          userNickname: userData.userNickname,
          userBio: userData.userBio,
        })
        .then((res) => {
          if (res.data.result) {
            setIsEditing(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setIsEditing(true);
    }
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
    <div>
      {isEditing ? (
        <div id="userPicNicknameEdit">
          {/* <input type="file"></input> */}
          <input
            type="text"
            id="nicknameEdit"
            value={userData.nickname}
            onChange={(e) =>
              setUserData({ ...userData, nickname: e.target.value })
            }
          />
          <input
            type="text"
            id="bioEdit"
            value={userData.bio}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
          />
          <button onClick={() => profileEdit("save")}>저장</button>
        </div>
      ) : (
        <div id="userPicNickname">
          {userData.pic}
          {userData.nickname}
          <br />
          {userData.bio}
          <br />
          <button onClick={() => profileEdit()}>수정</button>
        </div>
      )}

      <br />
      <Link to={`/user/style/list/${userNo}`}>내가 쓴 글</Link>
      <br />
      <Link to={`/user/style/write`}>글 작성하기</Link>
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
    </div>
  );
}
