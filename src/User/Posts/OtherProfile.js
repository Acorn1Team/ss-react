import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function OtherProfile() {
  const { profileUserNo } = useParams();

  // 조회하려는 유저 정보
  const [userInfo, setUserInfo] = useState([]);

  // 조회하려는 유저의 팔로잉, 팔로워 정보
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);

  // 로그인 유저가 조회하려는 유저의 팔로잉 여부
  const [followState, setFollowState] = useState(false);

  // 작성한 글 리스트
  const [postList, setPostList] = useState([]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(20);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  const nv = useNavigate();

  // 로그인 정보라고 가정함
  const userNo = sessionStorage.getItem("id");

  // 해당 프로필 유저 가져오기
  const getUserInfo = () => {
    axios
      .get(`/posts/user/${profileUserNo}`)
      .then((res) => setUserInfo(res.data))
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
        setPostList(res.data.content);
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

  // 해당 유저 팔로우하고 있는지 확인하기
  const followCheckProc = () => {
    axios
      .get(`/posts/user/follow/${userNo}/${profileUserNo}`)
      .then((res) => setFollowState(res.data.result))
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
            setFollowState(false);
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
            setFollowState(true);
            followInfo();
          }
        })
        .catch((error) => {
          console.log("팔로우 실패 :", error);
        });
    }
  };

  useEffect(() => {
    if (parseInt(profileUserNo, 10) === userNo) {
      nv(`/user/style/list/${userNo}`);
      // 로그인된 유저의 프로필 누를 경우 '내 글 보기' 로 이동
    } else {
      getUserInfo();
      followInfo();
      postInfo();
      followCheckProc();
    }
  }, [profileUserNo, userNo, currentPage]);

  return (
    <div>
      {userInfo.pic}&emsp;@{userInfo.nickname}
      <br />
      {userInfo.id}
      <br />
      {userInfo.bio}
      <button onClick={followOrCancel}>
        {followState ? "팔로우 취소" : "팔로우하기"}
      </button>
      <div>
        팔로우
        <Link
          to={`/user/style/${profileUserNo}/followList/followee`}
          onClick={followInfo}
        >
          {followeeData.length}
        </Link>
        &emsp; 팔로워
        <Link
          to={`/user/style/${profileUserNo}/followList/follower`}
          onClick={followInfo}
        >
          {followerData.length}
        </Link>
      </div>
      {postList.map((pl) => (
        <div key={pl.no}>
          <Link to={`/user/style/detail/${pl.no}`}>{pl.pic}</Link>
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
    </div>
  );
}
