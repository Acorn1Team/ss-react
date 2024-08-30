import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./PostList.css";

export default function PostList() {
  const [followPost, setFollowPost] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const userNo = sessionStorage.getItem("id");
  const observer = useRef();

  const defaultImage = "https://via.placeholder.com/200"; // 기본 이미지 URL

  useEffect(() => {
    if (hasMore && !isLoading) {
      getPostList();
    }
  }, [userNo, currentPage]);

  // 팔로우한 유저 게시글 정보 가져오기
  const getPostList = () => {
    setIsLoading(true); // 로딩 시작
    axios
      .get(`/posts/followOrPopular/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1
        );

        if (filteredPosts.length === 0 && currentPage === 0) {
          // 팔로우한 게시물이 없는 경우 전체 게시물 불러오기
          getAllPosts();
        } else {
          // 중복 데이터가 추가되지 않도록 prevPosts에 새로운 게시물 추가
          setFollowPost((prevPosts) => {
            const newPosts = filteredPosts.filter(
              (newPost) => !prevPosts.some((post) => post.no === newPost.no)
            );
            return [...prevPosts, ...newPosts];
          });
          setHasMore(currentPage + 1 < res.data.totalPages);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false); // 로딩 종료
      });
  };

  const getAllPosts = () => {
    axios
      .get(`/posts/popular`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const filteredPosts = res.data.content.filter(
          (post) => post.deleted < 1
        );
        setFollowPost((prevPosts) => [...prevPosts, ...filteredPosts]);
        setHasMore(currentPage + 1 < res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const lastPostElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, isLoading]
  );

  const handleImageLoadError = (e) => {
    e.target.style.display = "none"; // 이미지 숨김
  };

  const handleImageLoad = (e) => {
    const parentCard = e.target.closest(".post-card");
    if (parentCard) {
      parentCard.style.height = "auto"; // 이미지가 로드된 후 카드 높이를 조정
    }
  };

  return (
    <div className="post-list-container">
      {followPost.length > 0 ? (
        followPost.map((fp, index) => {
          if (followPost.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={fp.no} className="post-card">
                <Link to={`/user/style/detail/${fp.no}`}>
                  {fp.pic ? (
                    <img
                      src={fp.pic}
                      alt="포스트 이미지"
                      className="post-image"
                      onError={handleImageLoadError} // 이미지 로드 에러 처리
                    />
                  ) : (
                    <div className="no-image">이미지가 없습니다</div>
                  )}
                </Link>
                <div className="post-content">{fp.content}</div>
                <div className="post-nickname">
                  <Link to={`/user/style/profile/${fp.userNo}`}>
                    @{fp.userNickname}
                  </Link>
                </div>
              </div>
            );
          } else {
            return (
              <div key={fp.no} className="post-card">
                <Link to={`/user/style/detail/${fp.no}`}>
                  {fp.pic ? (
                    <img
                      src={fp.pic}
                      alt="포스트 이미지"
                      className="post-image"
                      onError={handleImageLoadError} // 이미지 로드 에러 처리
                    />
                  ) : (
                    <div className="no-image">이미지가 없습니다</div>
                  )}
                </Link>
                <div className="post-content">{fp.content}</div>
                <div className="post-nickname">
                  <Link to={`/user/style/profile/${fp.userNo}`}>
                    @{fp.userNickname}
                  </Link>
                </div>
              </div>
            );
          }
        })
      ) : (
        <div className="empty-message">
          <p>게시글을 불러오고 있습니다...</p>
        </div>
      )}
    </div>
  );
}
