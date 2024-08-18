import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Follow() {
  // 접근시 팔로잉 정보 요청인지, 팔로워 정보 요청인지 가지고 들어옴
  const { followInfo } = useParams();

  const [followData, setFollowData] = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  // 로그인 정보라고 가정
  const userNo = 3;

  // 팔로워 정보 가져오기
  const followerInfo = () => {
    axios
      .get(`/posts/user/follow/follower/${userNo}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  // 팔로잉 정보 가져오기
  const followeeInfo = () => {
    axios
      .get(`/posts/user/follow/followee/${userNo}`)
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
  const followOrCancle = (fno) => {
    if (followStatus[fno]) {
      axios
        .delete(`/posts/user/follow/${userNo}/${fno}`)
        .then((res) => {
          console.log(res.data.result);
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
          console.log(res.data.result);
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
    if (followInfo === "follower") {
      followerInfo();
    } else {
      followeeInfo();
    }
  }, [userNo, followInfo]);

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
          <button onClick={() => followOrCancle(f.no)}>
            {followStatus[f.no] ? "팔로우 취소하기" : "팔로우 하기"}
          </button>
        </div>
      ))}
    </div>
  );
}
