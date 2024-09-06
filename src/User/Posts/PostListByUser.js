import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Style/PostListByUser.module.css";

// 로그인된 유저의 내 작성 글 보기
export default function PostListByUser() {
  const [userPosts, setUserPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [showTrash, setShowTrash] = useState(false);

  // 로그인 정보라고 가정
  const no = sessionStorage.getItem("id");

  // 로그인된 유저가 쓴 글 불러오기
  const getPostsByUser = () => {
    axios
      .get(`/posts/list/${no}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        // 'deleted'가 false인 게시물만 필터링해서 상태로 저장
        const activePosts = res.data.content.filter((post) => !post.deleted);
        setUserPosts(activePosts || []);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getDeletedPosts = () => {
    axios
      .get(`/posts/deleted/${no}`)
      .then((res) => {
        setDeletedPosts(res.data.content || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (showTrash) {
      getDeletedPosts();
    } else {
      getPostsByUser();
    }
  }, [no, currentPage, showTrash]);

  const handleCheckboxChange = (postNo) => {
    if (selectedPosts.includes(postNo)) {
      setSelectedPosts(selectedPosts.filter((id) => id !== postNo));
    } else {
      setSelectedPosts([...selectedPosts, postNo]);
    }
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      const posts = showTrash ? deletedPosts : userPosts;
      setSelectedPosts(posts.map((post) => post.no));
    }
    setSelectAll(!selectAll);
  };

  const handleSoftDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedPosts.map((postNo) =>
          axios.delete(`/posts/soft-delete/${postNo}`)
        )
      );
      // userPosts 상태 업데이트
      const updatedUserPosts = userPosts.filter(
        (post) => !selectedPosts.includes(post.no)
      );
      setUserPosts(updatedUserPosts);

      setSelectedPosts([]);
      setSelectAll(false);
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    }
  };

  const handleRestoreSelected = async () => {
    try {
      await Promise.all(
        selectedPosts.map((postNo) => axios.put(`/posts/restore/${postNo}`))
      );
      getDeletedPosts();
      setSelectedPosts([]);
      setSelectAll(false);
    } catch (error) {
      console.error("복구 중 오류 발생:", error);
    }
  };

  const handlePermanentDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedPosts.map((postNo) =>
          axios.delete(`/posts/permanent-delete/${postNo}`)
        )
      );
      getDeletedPosts();
      setSelectedPosts([]);
      setSelectAll(false);
    } catch (err) {
      console.log("영구 삭제 실패:", err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonGroup}>
        <button onClick={() => setShowTrash(false)}>내 게시물</button>
        <button onClick={() => setShowTrash(true)}>휴지통</button>
      </div>

      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
        전체 선택
        {!showTrash ? (
          <button
            onClick={handleSoftDeleteSelected}
            disabled={selectedPosts.length === 0}
          >
            선택 삭제
          </button>
        ) : (
          <>
            <button
              onClick={handleRestoreSelected}
              disabled={selectedPosts.length === 0}
            >
              선택 복구
            </button>
            <button
              onClick={handlePermanentDeleteSelected}
              disabled={selectedPosts.length === 0}
            >
              영구 삭제
            </button>
          </>
        )}
      </div>

      {!showTrash ? (
        <>
          <h2>내 게시물</h2>
          {userPosts && userPosts.length > 0 ? (
            userPosts.map((up) => (
              <div key={up.no} className={styles.postContainer}>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(up.no)}
                  onChange={() => handleCheckboxChange(up.no)}
                />
                <Link to={`/user/style/detail/${up.no}`}>
                  <img width={"300px"} src={up.pic} alt={up.no}></img>
                  <br />
                  {up.content}
                </Link>
              </div>
            ))
          ) : (
            <p>게시물이 없습니다.</p> // userPosts가 비어 있을 때 보여줄 내용
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                이전
              </button>
              <span>
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
        <>
          <h2>휴지통 (삭제된 게시물)</h2>
          {deletedPosts.length > 0 ? (
            deletedPosts.map((post) => (
              <div key={post.no} className={styles.postContainer}>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.no)}
                  onChange={() => handleCheckboxChange(post.no)}
                />
                {post.content}
              </div>
            ))
          ) : (
            <p className={styles.noPostsMessage}>휴지통이 비어 있습니다.</p>
          )}
        </>
      )}
    </div>
  );
}
