import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PostList.css"; // CSS 파일을 import

export default function PostList() {
  const [followPost, setFollowPost] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(4); // 페이지당 4개의 게시글 표시
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("follow"); // "follow" 또는 "all"
  const [hasFollows, setHasFollows] = useState(false); // 팔로우 여부 확인

  const userNo = sessionStorage.getItem("id");

  useEffect(() => {
    checkIfUserHasFollows();
  }, [userNo]);

  useEffect(() => {
    if (userNo) {
      loadPosts();
    }
  }, [currentPage, viewMode]); // viewMode가 변경될 때마다 loadPosts 호출

  // 팔로우 여부 확인
  const checkIfUserHasFollows = () => {
    axios
      .get(`/posts/user/follow/${userNo}`)
      .then((res) => {
        if (res.data.followeeList && res.data.followeeList.length > 0) {
          setHasFollows(true); // 팔로우가 있으면 true로 설정
          setViewMode("follow"); // 기본은 팔로우 게시물 보기로 설정
        } else {
          setViewMode("all");
          setHasFollows(false);
        }
        setCurrentPage(0); // 페이지를 0으로 초기화
      })
      .catch((err) => {
        console.log("팔로우한 유저 확인 오류:", err);
      });
  };

  // 게시글 불러오기
  const loadPosts = () => {
    setIsLoading(true);
    const apiEndpoint =
      viewMode === "follow"
        ? `/posts/followOrPopular/${userNo}`
        : `/posts/popular`;

    axios
      .get(apiEndpoint, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        // 삭제된 게시물을 제외하고 불러옴
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1
        );
        setFollowPost(filteredPosts); // 페이지를 변경할 때마다 갱신
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleImageLoadError = (e) => {
    e.target.style.display = "none";
  };

  // 페이지 전환 함수
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 뷰 모드 전환 함수
  const handleViewModeChange = (mode) => {
    setViewMode(mode); // viewMode만 업데이트하고, 게시글 로드는 useEffect에서 처리
    setCurrentPage(0); // 페이지를 0으로 초기화
  };

  return (
    <div>
      {hasFollows && ( // 팔로우가 있을 때만 버튼을 보여줌
        <div className="view-mode-buttons">
          <button
            onClick={() => handleViewModeChange("follow")}
            disabled={viewMode === "follow"}
          >
            팔로우한 사람 게시글 보기
          </button>
          <button
            onClick={() => handleViewModeChange("all")}
            disabled={viewMode === "all"}
          >
            전체 보기
          </button>
        </div>
      )}

      <div className="post-list-container">
        {followPost.length > 0 ? (
          followPost.map((fp) => (
            <div key={fp.no} className="post-card">
              <Link to={`/user/style/detail/${fp.no}`}>
                {fp.pic ? (
                  <img
                    src={fp.pic}
                    alt="포스트 이미지"
                    className="post-image"
                    onError={handleImageLoadError}
                  />
                ) : (
                  <div className="no-image">이미지가 없습니다</div>
                )}
              </Link>
              {/* 글 내용을 클릭하면 상세 페이지로 이동하도록 Link 추가 */}
              <Link to={`/user/style/detail/${fp.no}`}>
                <div className="post-content">{fp.content}</div>
              </Link>
              <div className="post-nickname">
                <Link to={`/user/style/profile/${fp.userNo}`}>
                  @{fp.userNickname}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">
            <p>게시글이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="pagination-buttons">
        <button onClick={handlePreviousPage} disabled={currentPage === 0}>
          이전
        </button>
        <span>
          {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage + 1 >= totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}
