import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Style/OtherProfile.module.css";

export default function OtherProfile() {
  const { profileUserNo } = useParams();

  // 조회하려는 유저 정보
  const [userInfo, setUserInfo] = useState([]);

  // 조회하려는 유저의 팔로잉, 팔로워 정보
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);

  // 로그인 유저가 조회하려는 유저의 팔로잉 여부
  const [followState, setFollowState] = useState();

  // 작성한 글 리스트
  const [postList, setPostList] = useState([]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(20);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  const [userCheck, setUserCheck] = useState(true);

  const nv = useNavigate();

  // 로그인 정보라고 가정함
  const userNo = sessionStorage.getItem("id");

  // 해당 프로필 유저 가져오기
  const getUserInfo = () => {
    axios
      .get(`/posts/user/${profileUserNo}`)
      .then((res) => {
        setUserInfo(res.data);
        if (res.data.email === null) {
          setUserCheck(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 팔로잉, 팔로워 정보
  const followInfo = () => {
    axios
      .get(`/posts/user/follow/${profileUserNo}`)
      .then((res) => {
        setFolloweeData(res.data.followeeList);
        setFollowerData(res.data.followerList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 해당 유저가 작성한 글 리스트 가져오기
  const postInfo = () => {
    axios
      .get(`/posts/list/${profileUserNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        // 삭제된 글(deleted 값이 1 이상)을 제외한 글 리스트로 필터링
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1
        );

        setPostList(filteredPosts); // 필터링된 게시글 리스트 설정
        setTotalPages(res.data.totalPages); // 전체 페이지 수 설정
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

  // 해당 유저 팔로우하고 있는지 확인하기
  const followCheckProc = () => {
    axios
      .get(`/posts/user/follow/${userNo}/${profileUserNo}`)
      .then((res) => {
        setFollowState(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // followCheckProc에서 확인한 팔로우 상태값을 기준으로 팔로우 / 언팔로우
  const followOrCancel = () => {
    if (followState) {
      axios
        .delete(`/posts/user/follow/${userNo}/${profileUserNo}`)
        .then((res) => {
          if (res.data.result) {
            if (followState) {
              setFollowState(false);
            }
            followInfo();
          }
        })
        .catch((error) => {
          console.log("팔로우 취소 실패 :", error);
        });
    } else {
      axios
        .post("/posts/user/follow", {
          followeeNo: profileUserNo,
          followerNo: userNo,
        })
        .then((res) => {
          if (res.data.result) {
            if (!followState) {
              setFollowState(true);
            }
            followInfo();
          }
        })
        .catch((error) => {
          console.log("팔로우 실패 :", error);
        });
    }
  };

  useEffect(() => {
    if (profileUserNo === userNo) {
      nv(`/user/style/list/${userNo}`);
    } else if (profileUserNo === "1") {
      nv(`/user/mypage/notice`);
    } else {
      followCheckProc();
      followInfo();
      getUserInfo();
      postInfo();
    }
  }, [profileUserNo, userNo, currentPage, userCheck]);

  return (
    <div className={styles.profileContainer}>
      {userCheck ? (
        <div className={styles.profileContent}>
          <img
            src={userInfo.pic}
            alt={userInfo.nickname}
            className={styles.profileImage}
          />
          <div className={styles.profileInfo}>
            <span className={styles.profileNickname}>@{userInfo.nickname}</span>
            <br />
            <span className={styles.profileId}>{userInfo.id}</span>
            <br />
            <span className={styles.profileBio}>{userInfo.bio}</span>
          </div>
          {followState !== null && (
            <button className={styles.followButton} onClick={followOrCancel}>
              {followState ? "팔로우 취소" : "팔로우하기"}
            </button>
          )}
          <div className={styles.followStats}>
            <span>
              팔로우{" "}
              <Link
                to={`/user/style/${profileUserNo}/followList/followee`}
                onClick={followInfo}
                className={styles.followLink}
              >
                {followeeData.length}
              </Link>
            </span>
            &emsp;
            <span>
              팔로워{" "}
              <Link
                to={`/user/style/${profileUserNo}/followList/follower`}
                onClick={followInfo}
                className={styles.followLink}
              >
                {followerData.length}
              </Link>
            </span>
          </div>
          <div className={styles.postList}>
            {postList.map((pl) => (
              <div key={pl.no} className={styles.postItem}>
                <Link to={`/user/style/detail/${pl.no}`}>
                  <img src={pl.pic} alt={pl.no} className={styles.postImage} />
                </Link>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={styles.pageButton}
              >
                이전
              </button>
              <span className={styles.pageInfo}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                className={styles.pageButton}
              >
                다음
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.deletedMessage}>탈퇴한 회원입니다.</div>
      )}
    </div>
  );
}
