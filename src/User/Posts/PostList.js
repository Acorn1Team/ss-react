import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./PostList.css";

export default function PostList() {
  const [followPost, setFollowPost] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const userNo = sessionStorage.getItem("id");
  const observer = useRef();

  const defaultImage = "https://via.placeholder.com/200"; // 기본 이미지 URL

  useEffect(() => {
    getPostList();
  }, [userNo, currentPage]);

  // 팔로우한 유저 게시글 정보 가져오기
  const getPostList = () => {
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
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  const handleImageLoadError = (event) => {
    event.target.style.display = "none"; // 이미지 숨김
    event.target.insertAdjacentHTML("afterend", `<div>이미지 로드 실패</div>`); // 파일 이름 표시 또는 경고 메시지
  };

  return (
    <div className="post-list-container">
      {followPost.length > 0 ? (
        followPost.map((fp, index) => {
          const imageUrl = fp.pic ? fp.pic : defaultImage; // 이미지가 없는 경우 기본 이미지 사용
          if (followPost.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={fp.no} className="post-card">
                <Link to={`/user/style/detail/${fp.no}`}>
                  <img
                    src={imageUrl}
                    alt={fp.pic}
                    className="post-image"
                    onError={handleImageLoadError} // 이미지 로드 에러 처리
                  />
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
                  <img
                    src={imageUrl}
                    alt={fp.pic}
                    className="post-image"
                    onError={handleImageLoadError} // 이미지 로드 에러 처리
                  />
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
          <p>팔로우한 사용자가 아직 게시글을 올리지 않았어요.</p>
          <p>지금 인기 게시물을 확인해보세요!</p>
        </div>
      )}
    </div>
  );
}
