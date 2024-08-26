import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PostList() {
  const [followPost, setFollowPost] = useState([]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  // 로그인 정보라고 가정
  const userNo = 3;

  useEffect(() => {
    getPostList();
  }, [userNo, currentPage]);

  // 팔로우한 유저 게시글 정보 가져오기
  const getPostList = () => {
    axios
      .get(`/posts/followPostList/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setFollowPost(res.data.content);
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

  return (
    <div>
      {followPost.map((fp) => (
        <div key={fp.no}>
          {fp.userPic}&emsp;
          <Link to={`/user/style/profile/${fp.userNo}`}>
            @{fp.userNickname}
          </Link>
          <br />
          <Link to={`/user/style/detail/${fp.no}`}>
            <img src={fp.pic} alt={fp.pic} />
            <b>{fp.pic}</b>
            {fp.content}
          </Link>
          <hr />
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
