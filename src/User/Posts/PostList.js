import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PostList.css";
import "../Style/All.css";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [hasFollowers, setHasFollowers] = useState(false); // 팔로우 여부 확인
  const [isFollowChecked, setIsFollowChecked] = useState(false);

  const userNo = sessionStorage.getItem("id");

  useEffect(() => {
    if (userNo) {
      checkIfUserHasFollowers(); // 팔로우한 사람 있는지 체크
    }
  }, [userNo]);

  useEffect(() => {
    if (!isLoading && isFollowChecked) {
      if (viewMode === "all") {
        loadAllPosts(); // 전체 게시글 불러오기
      } else if (viewMode === "follow" && hasFollowers) {
        loadFollowPosts(); // 팔로우한 사람의 게시글 불러오기
      }
    }
  }, [viewMode, currentPage, sortOrder, isFollowChecked]);

  // 팔로우한 사람이 있는지 확인하는 함수
  const checkIfUserHasFollowers = () => {
    setIsLoading(true);
    axios
      .get(`/api/posts/user/follow/followee/${userNo}`, {
        params: {
          page: 0, // 첫 페이지에서 팔로우 게시글 확인
          size: 1, // 팔로우한 사람 1명만 체크
        },
      })
      .then((res) => {
        if (res.data.content.length > 0) {
          setHasFollowers(true); // 팔로우한 사람이 있으면 true
        } else {
          setHasFollowers(false); // 팔로우한 사람이 없으면 false
        }
        setIsFollowChecked(true); // 팔로우 체크 완료
      })
      .catch((err) => {
        console.log("팔로우 체크 오류:", err);
        setHasFollowers(false);
        setIsFollowChecked(true); // 오류 발생 시에도 체크 완료로 설정
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 팔로우 게시글 불러오기
  const loadFollowPosts = () => {
    setIsLoading(true);
    axios
      .get(`/api/posts/followOrPopular/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1 || post.reportsCount <= 5
        );
        setPosts(filteredPosts);
        setTotalPages(res.data.totalPages);
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
    const url =
      sortOrder === "latest" ? "/api/posts/latest" : "/api/posts/popular";
    axios
      .get(url, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1 || post.reportsCount <= 5
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
    if (mode === "follow" && !hasFollowers) {
      setViewMode("all"); // 팔로우한 게시글이 없으면 전체보기로 전환
    } else {
      setViewMode(mode);
    }
    setCurrentPage(0); // 페이지를 0으로 초기화
  };

  // 정렬 모드 변경 함수
  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(0); // 페이지를 0으로 초기화
  };

  return (
    <div>
      <div className="view-mode-buttons">
        {/* 팔로우한 사람이 있을 때만 버튼을 표시 */}
        {hasFollowers && (
          <button
            className={viewMode === "follow" ? "btn2" : "btn1"}
            onClick={() => handleViewModeChange("follow")}
          >
            팔로우한 사람 게시글 보기
          </button>
        )}
        <button
          className={viewMode === "all" ? "btn2" : "btn1"}
          onClick={() => handleViewModeChange("all")}
        >
          전체 보기
        </button>
      </div>

      {viewMode !== "follow" && (
        <div className="sort-buttons">
          <button
            className={sortOrder === "latest" ? "btn2" : "btn1"}
            onClick={() => handleSortChange("latest")}
          >
            최신순
          </button>
          <button
            className={sortOrder === "popular" ? "btn2" : "btn1"}
            onClick={() => handleSortChange("popular")}
          >
            인기순
          </button>
        </div>
      )}

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
