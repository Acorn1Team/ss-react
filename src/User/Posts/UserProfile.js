import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import styles from "../Style/UserProfile.module.css"; // CSS 모듈 임포트

export default function UserProfile() {
  const [userData, setUserData] = useState({
    nickname: "",
    bio: "",
  });
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [nicknameError, setNicknameError] = useState(false);
  const [bioError, setBioError] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false); // 저장 버튼 상태

  const userNo = sessionStorage.getItem("id");

  const location = useLocation(); // 현재 위치를 얻어오는 hook

  const userInfo = () => {
    axios
      .get(`/posts/user/${userNo}`)
      .then((res) => {
        setUserData({
          nickname: res.data.nickname || "",
          bio: res.data.bio || "",
        });
      })
      .catch((err) => console.log(err));
  };

  const profileEdit = (action) => {
    const nickname = userData.nickname || "";
    const bio = userData.bio || "";

    if (action === "save") {
      if (nickname.length > 10 || bio.length > 30) {
        if (nickname.length > 10) setNicknameError(true);
        if (bio.length > 30) setBioError(true);
        return;
      }

      const formData = new FormData();
      formData.append(
        "userDto",
        new Blob(
          [
            JSON.stringify({
              nickname: nickname,
              bio: bio,
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
            userInfo();
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
    // nicknameError나 bioError가 변경될 때 저장 버튼 상태 업데이트
    setIsSaveDisabled(nicknameError || bioError);
  }, [nicknameError, bioError]);

  useEffect(() => {
    userInfo();
    followInfo();
  }, [userNo]);

  return (
    <div className={styles.profileContainer}>
      {isEditing ? (
        <div id="userPicNicknameEdit">
          <input type="file" />{" "}
          {isSaveDisabled && (
            <span style={{ color: "red", fontSize: "60%" }}>
              이미 사용 중인 닉네임입니다.
            </span>
          )}
          <input
            type="text"
            className={`${styles.editInput} ${
              nicknameError ? styles.error : ""
            }`}
            value={userData.nickname}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 10) {
                axios
                  .get(`/nickname/check/${newValue}`)
                  .then((res) => {
                    if (res.data.result) {
                      setNicknameError(true);
                    } else {
                      setNicknameError(false);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
                setUserData({ ...userData, nickname: newValue });
                setNicknameError(false); // 유효성 오류 없앰
              } else {
                setNicknameError(true); // 10글자 넘으면 오류
              }
            }}
            placeholder="닉네임 (최대 10자)"
          />
          <input
            type="text"
            className={`${styles.editInput} ${bioError ? styles.error : ""}`}
            value={userData.bio}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 30) {
                setUserData({ ...userData, bio: newValue });
                setBioError(false); // 유효성 오류 없앰
              } else {
                setBioError(true); // 30글자 넘으면 오류
              }
            }}
            placeholder="소개글 (최대 30자)"
          />
          <button
            className={styles.editButton}
            onClick={() => profileEdit("save")}
            disabled={isSaveDisabled}
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

      <div className={styles.profileActions}>
        <Link
          to={`/user/style/list/${userNo}`}
          className={styles.profileActionLink}
        >
          내가 쓴 글
        </Link>
        {location.pathname !== "/user/style/write" && (
          <Link
            to={`/user/style/write`}
            // onClick={handleWriteButtonClick}
            className={styles.profileActionLink}
          >
            글 작성하기
          </Link>
        )}
      </div>

      <div className={styles.followInfo}>
        <Link
          to={`/user/style/${userNo}/followList/followee`}
          className={styles.followLink}
        >
          팔로우 {followeeData.length}
        </Link>
        <Link
          to={`/user/style/${userNo}/followList/follower`}
          className={styles.followLink}
        >
          팔로워 {followerData.length}
        </Link>
      </div>
    </div>
  );
}
