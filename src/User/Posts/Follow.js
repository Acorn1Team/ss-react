import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Style/Follow.module.css"; // CSS 모듈 임포트

export default function Follow() {
  const { userFollowNo, followInfo } = useParams();

  const [followData, setFollowData] = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  const [isMyPage, setIsMyPage] = useState(false);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  const nv = useNavigate();

  const userNo = sessionStorage.getItem("id");

  const followerInfo = (userNoToUse) => {
    axios
      .get(`/posts/user/follow/follower/${userNoToUse}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setFollowData(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const followeeInfo = (userNoToUse) => {
    axios
      .get(`/posts/user/follow/followee/${userNoToUse}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setFollowData(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const followCheckProc = (fno) => {
    axios
      .get(`/posts/user/follow/${userNo}/${fno}`)
      .then((res) => {
        setFollowStatus((pstatus) => ({
          ...pstatus,
          [fno]: res.data.result,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteFollower = (fno) => {
    axios
      .delete(`/posts/user/follow/${fno}/${userNo}`)
      .then((res) => {
        if (res.data.result) {
          setFollowData((prevData) => prevData.filter((f) => f.no !== fno));
        }
      })
      .catch((error) => {
        console.log("팔로우 취소 실패 :", error);
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
            axios.post(`/alert/follow/from/${userNo}`, {
              userNo: fno,
              isRead: 0,
            });
          }
        })
        .catch((error) => {
          console.log("팔로우 실패 :", error);
        });
    }
  };

  useEffect(() => {
    if (userNo === userFollowNo) {
      setIsMyPage(true);
    }
    const userNoToUse = userFollowNo || userNo;
    if (followInfo === "follower") {
      followerInfo(userNoToUse);
    } else {
      followeeInfo(userNoToUse);
    }
  }, [userNo, userFollowNo, followInfo, currentPage]);

  useEffect(() => {
    if (followData.length > 0) {
      followData.forEach((f) => {
        followCheckProc(f.no);
      });
    }
  }, [followData]);

  return (
    <div className={styles.followContainer}>
      <h2>{followInfo === "followee" ? "팔로잉" : "팔로워"}</h2>
      {followData && followData.length > 0 ? (
        <>
          {followData.map((f) => (
            <div key={f.no} className={styles.followItem}>
              <img src={f.pic} alt="Profile" className={styles.profilePic} />
              <Link to={`/user/style/profile/${f.no}`}>@{f.nickname}</Link>
              {isMyPage && followInfo === "follower" ? (
                <button onClick={() => deleteFollower(f.no)} className="btn3">
                  삭제하기
                </button>
              ) : userNo !== String(f.no) ? (
                <button
                  onClick={() => followOrCancel(f.no)}
                  className={followStatus[f.no] ? `btn3` : `btn1`}
                >
                  {followStatus[f.no] ? "팔로우 취소하기" : "팔로우 하기"}
                </button>
              ) : (
                <button
                  onClick={() => nv(`../profile/${userNo}`)}
                  className="btn3"
                >
                  It's Me!
                </button>
              )}
            </div>
          ))}
          {totalPages > 1 && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                이전
              </button>
              <span style={{ margin: "0 10px" }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        <div>팔로우 정보가 없습니다.</div>
      )}
    </div>
  );
}
