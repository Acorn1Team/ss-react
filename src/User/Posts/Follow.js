import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Follow() {
  const { userFollowNo } = useParams();

  // 접근시 팔로잉 정보 요청인지, 팔로워 정보 요청인지 가지고 들어옴
  const { followInfo } = useParams();

  const [followData, setFollowData] = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  // 로그인된 유저 정보라고 가정
  const userNo = 3;

  // 팔로워 정보 가져오기
  const followerInfo = (userNoToUse) => {
    axios
      .get(`/posts/user/follow/follower/${userNoToUse}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  // 팔로잉 정보 가져오기
  const followeeInfo = (userNoToUse) => {
    axios
      .get(`/posts/user/follow/followee/${userNoToUse}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  // 팔로우 여부 체크하기
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

  // 팔로우 -> 언팔로우 / 언팔로우 -> 팔로우
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
    <div>
      {followData.map((f) => (
        <div key={f.no}>
          <Link to={`/user/main/style/${f.no}`}>
            {f.pic}
            {f.nickname}
          </Link>
          <button onClick={() => followOrCancel(f.no)}>
            {followStatus[f.no] ? "팔로우 취소하기" : "팔로우 하기"}
          </button>
        </div>
      ))}
    </div>
  );
}
