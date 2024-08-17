import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Follow() {
  const { no, followInfo } = useParams();
  const [followData, setFollowData] = useState([]);
  const [followStatus, setFollowStatus] = useState({}); // 객체로 변경

  useEffect(() => {
    if (followInfo === "follower") {
      followerInfo();
    } else {
      followeeInfo();
    }
  }, [no, followInfo]);

  useEffect(() => {
    if (followData.length > 0) {
      followData.forEach((f) => {
        followCheckProc(f.no);
      });
    }
  }, [followData]);

  const followerInfo = () => {
    axios
      .get(`/posts/user/follow/follower/${no}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  const followeeInfo = () => {
    axios
      .get(`/posts/user/follow/followee/${no}`)
      .then((res) => setFollowData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  const followCheckProc = (fno) => {
    axios
      .get(`/posts/user/follow/check/${no}/${fno}`) // fno는 숫자 값이어야 합니다.
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

  const followOrCancle = (fno) => {
    if (followStatus[fno]) {
      axios
        .delete(`/posts/user/follow/delete/${no}/${fno}`)
        .then((res) => {
          setFollowStatus((pstatus) => ({
            ...pstatus,
            [fno]: false,
          }));
        })
        .catch((error) => {
          console.log("팔로우 취소 실패 :", error);
        });
    } else {
      axios
        .post("/posts/user/follow/insert", {
          followeeNo: fno,
          followerNo: no,
        })
        .then((res) => {
          setFollowStatus((pstatus) => ({
            ...pstatus,
            [fno]: true,
          }));
        })
        .catch((error) => {
          console.log("팔로우 실패 :", error);
        });
    }
  };

  return (
    <div>
      {followData.map((f) => (
        <div key={f.no}>
          {f.pic}
          {f.nickname}
          <br />
          <button onClick={() => followOrCancle(f.no)}>
            {followStatus[f.no] ? "팔로우 취소하기" : "팔로우 하기"}
          </button>
        </div>
      ))}
    </div>
  );
}
