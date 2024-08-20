import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../Style/Follow.module.css"; // CSS 모듈 임포트

export default function Follow() {
  const { userFollowNo, followInfo } = useParams();

  const [followData, setFollowData] = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  const userNo = 3;

  const followerInfo = (userNoToUse) => {
    axios
      .get(`/posts/user/follow/follower/${userNoToUse}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  const followeeInfo = (userNoToUse) => {
    axios
      .get(`/posts/user/follow/followee/${userNoToUse}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  const followCheckProc = (fno) => {
    axios
      .get(`/posts/user/follow/${userNo}/${fno}`)
      .then((res) => {
        setFollowStatus((pstatus) => ({
          ...pstatus,
          [fno]: res.data,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const followOrCancel = (fno) => {
    if (followStatus[fno]) {
      axios
        .delete(`/posts/user/follow/${userNo}/${fno}`)
        .then((res) => {
          if (res.data.result) {
            setFollowStatus((pstatus) => ({
              ...pstatus,
              [fno]: false,
            }));
          }
        })
        .catch((error) => {
          console.log("팔로우 취소 실패 :", error);
        });
    } else {
      axios
        .post("/posts/user/follow", {
          followeeNo: fno,
          followerNo: userNo,
        })
        .then((res) => {
          if (res.data.result) {
            setFollowStatus((pstatus) => ({
              ...pstatus,
              [fno]: true,
            }));
          }
        })
        .catch((error) => {
          console.log("팔로우 실패 :", error);
        });
    }
  };

  useEffect(() => {
    const userNoToUse = userFollowNo || userNo;
    if (followInfo === "follower") {
      followerInfo(userNoToUse);
    } else {
      followeeInfo(userNoToUse);
    }
  }, [userNo, userFollowNo, followInfo]);

  useEffect(() => {
    if (followData.length > 0) {
      followData.forEach((f) => {
        followCheckProc(f.no);
      });
    }
  }, [followData]);

  return (
    <div className={styles.followContainer}>
      {followInfo === "followee" ? "팔로잉" : "팔로워"}
      {followData.map((f) => (
        <div key={f.no} className={styles.followItem}>
          <img src={f.pic} alt="Profile" className={styles.profilePic} />
          <Link to={`/user/style/profile/${f.no}`}> @{f.nickname}</Link>
          <button
            onClick={() => followOrCancel(f.no)}
            className={
              followStatus[f.no] ? styles.unfollowButton : styles.followButton
            }
          >
            {followStatus[f.no] ? "팔로우 취소하기" : "팔로우 하기"}
          </button>
        </div>
      ))}
    </div>
  );
}
