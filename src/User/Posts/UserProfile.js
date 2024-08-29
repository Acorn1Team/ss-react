import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Style/UserProfile.module.css"; // CSS 모듈 임포트

export default function UserProfile() {
  // 로그인 유저 데이터
  const [userData, setUserData] = useState([]);

  // 로그인 유저의 팔로잉, 팔로워 데이터
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);

  // 수정 모드 온/오프 컨트롤
  const [isEditing, setIsEditing] = useState(false);

  const userNo = sessionStorage.getItem("id");

  // 로그인된 유저 정보 가져오기
  const userInfo = () => {
    axios
      .get(`/posts/user/${userNo}`)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err));
  };

  // 유저 정보 수정/저장 버튼 클릭시
  const profileEdit = (action) => {
    if (action === "save") {
      // 수정 이후 저장 버튼 클릭했을 경우
      const formData = new FormData();
      formData.append(
        "userDto",
        new Blob(
          [
            JSON.stringify({
              userNickname: userData.nickname,
              userBio: userData.bio,
            }),
          ],
          { type: "application/json" }
        )
      );

      if (document.querySelector('input[type="file"]').files[0]) {
        formData.append(
          "profileImage",
          document.querySelector('input[type="file"]').files[0]
        );
      }

      axios
        .put(`/posts/user/${userNo}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.result) {
            setIsEditing(false);
            userInfo(); // 수정 후 업데이트된 정보를 다시 가져옴
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // 수정 버튼 클릭했을 경우
      setIsEditing(true);
    }
  };

  // 팔로잉, 팔로워 정보 가져오기
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
    <div className={styles.profileContainer}>
      {isEditing ? (
        <div id="userPicNicknameEdit">
          <input type="file" />
          <input
            type="text"
            className={styles.editInput}
            value={userData.nickname || ""}
            onChange={(e) =>
              setUserData({ ...userData, nickname: e.target.value })
            }
          />
          <div>{userData.id}</div>
          <input
            type="text"
            className={styles.editInput}
            value={userData.bio || ""}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
          />
          <button
            className={styles.editButton}
            onClick={() => profileEdit("save")}
          >
            저장
          </button>
        </div>
      ) : (
        <div className={styles.profileContent}>
          <img src={userData.pic} alt="Profile" className={styles.profilePic} />
          <div className={styles.profileNickname}>@{userData.nickname}</div>
          <div className={styles.profileNickname}>{userData.id}</div>
          <div className={styles.profileBio}>{userData.bio}</div>
          <button className={styles.editButton} onClick={() => profileEdit()}>
            수정
          </button>
        </div>
      )}

      <div>
        <Link to={`/user/style/list/${userNo}`}>내가 쓴 글</Link>
        <br />
        <Link to={`/user/style/write`}>글 작성하기</Link>
      </div>
      <div className={styles.followInfo}>
        <Link
          to={`/user/style/${userNo}/followList/followee`}
          className={styles.followLink}
          onClick={followInfo}
        >
          팔로우 {followeeData.length}
        </Link>
        <Link
          to={`/user/style/${userNo}/followList/follower`}
          className={styles.followLink}
          onClick={followInfo}
        >
          팔로워 {followerData.length}
        </Link>
      </div>
    </div>
  );
}
