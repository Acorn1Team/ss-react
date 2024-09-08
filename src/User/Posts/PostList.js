import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PostList.css"; // CSS 파일을 import

export default function PostList() {
  const [posts, setPosts] = useState([]); // 모든 게시글을 관리
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(4); // 페이지당 4개의 게시글 표시
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("follow"); // "follow" 또는 "all"
  const [hasFollowPosts, setHasFollowPosts] = useState(false); // 팔로우한 사람의 게시글 여부 확인
  const [isUserAction, setIsUserAction] = useState(false); // 사용자가 수동으로 모드를 변경했는지 여부

  const userNo = sessionStorage.getItem("id");

  useEffect(() => {
    if (userNo) {
      loadFollowPosts(); // 페이지 처음 로드 시 팔로우 게시글을 불러옴
    }
  }, [userNo]);

  useEffect(() => {
    if (!isLoading) {
      // viewMode가 변경될 때마다 해당 게시글을 로드
      if (viewMode === "all") {
        loadAllPosts();
      } else if (viewMode === "follow") {
        loadFollowPosts();
      }
    }
  }, [viewMode, currentPage]);

  // 팔로우 게시글 불러오기
  const loadFollowPosts = () => {
    setIsLoading(true);
    axios
      .get(`/posts/followOrPopular/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1 || post.reports_count <= 5
        );
        setPosts(filteredPosts);
        setTotalPages(res.data.totalPages);

        if (filteredPosts.length === 0 && !isUserAction) {
          // 팔로우한 사람 게시글이 없을 경우 자동으로 전체 보기로 전환
          setViewMode("all");
        } else {
          setHasFollowPosts(true); // 팔로우한 사람의 게시글이 있음
        }
      })
      .catch((err) => {
        console.log("팔로우 게시글 로딩 오류:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 전체 게시글 불러오기
  const loadAllPosts = () => {
    setIsLoading(true);
    axios
      .get(`/posts/popular`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1 || post.reports_count <= 5
        );
        setPosts(filteredPosts);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log("전체 게시글 로딩 오류:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleImageLoadError = (e) => {
    e.target.style.display = "none";
  };

  // 글 내용을 100자 제한으로 자르기
  const truncateContent = (content, limit = 100) => {
    if (content.length > limit) {
      return content.slice(0, limit) + "...";
    }
    return content;
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
    // 상태 업데이트 후 바로 useEffect에서 게시글을 로드
    setViewMode(mode);
    setIsUserAction(true); // 사용자가 직접 전환함을 표시
    setCurrentPage(0); // 페이지를 0으로 초기화
  };

  return (
    <div>
      <div className="view-mode-buttons">
        {/* 팔로우한 사람 게시글 보기와 전체 보기 버튼 */}
        <button
          onClick={() => handleViewModeChange("follow")}
          disabled={viewMode === "follow" && hasFollowPosts === false}
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

      <div className="post-list-container">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.no} className="post-card">
              <Link to={`/user/style/detail/${post.no}`}>
                {post.pic ? (
                  <img
                    src={post.pic}
                    alt="포스트 이미지"
                    className="post-image"
                    onError={handleImageLoadError}
                  />
                ) : (
                  <div className="no-image">이미지가 없습니다</div>
                )}
              </Link>
              <Link to={`/user/style/detail/${post.no}`}>
                <div className="post-content">
                  {truncateContent(post.content, 100)}
                </div>
              </Link>
              <div className="post-nickname">
                <Link to={`/user/style/profile/${post.userNo}`}>
                  @{post.userNickname}
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

      {posts.length > 0 && (
        <div className="pagination">
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
      )}
    </div>
  );
}
