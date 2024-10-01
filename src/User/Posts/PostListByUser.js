import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Style/PostListByUser.module.css";
import "../Style/All.css";
import { MdDeleteForever } from "react-icons/md";
import { FaBorderAll } from "react-icons/fa";

export default function PostListByUser() {
  const [userPosts, setUserPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [deletedCurrentPage, setDeletedCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [deletedTotalPages, setDeletedTotalPages] = useState(0);
  const [showTrash, setShowTrash] = useState(false);

  const no = sessionStorage.getItem("id");

  // // 로그인된 유저가 쓴 글 불러오기
  // const getPostsByUser = () => {
  //   axios
  //     .get(`/posts/list/${no}`, {
  //       params: {
  //         page: currentPage,
  //         size: pageSize,
  //       },
  //     })
  //     .then((res) => {
  //       const activePosts = res.data.content.filter((post) => !post.deleted);
  //       setUserPosts(activePosts || []);

  //       // totalPages가 1 이상이고 현재 페이지에 게시물이 없으면, totalPages를 1로 설정
  //       const pages = res.data.totalPages;
  //       setTotalPages(activePosts.length > 0 ? pages : 1);

  //       // 게시물이 없으면 currentPage를 0으로 초기화
  //       if (activePosts.length === 0 && currentPage > 0) {
  //         setCurrentPage(0);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // 로그인된 유저가 쓴 글 불러오기
  const getPostsByUser = () => {
    axios
      .get(`/api/posts/list/${no}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const activePosts = res.data.content.filter((post) => !post.deleted);
        setUserPosts(activePosts || []);

        // 게시물이 없으면 totalPages를 1로 설정
        const pages = res.data.totalPages;
        setTotalPages(activePosts.length > 0 ? pages : 1);

        // 현재 페이지에 게시물이 없으면 currentPage를 0으로 초기화
        if (activePosts.length === 0 && currentPage > 0) {
          setCurrentPage(0);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 휴지통에 있는 글 불러오기
  const getDeletedPosts = () => {
    axios
      .get(`/api/posts/deleted/${no}`, {
        params: {
          page: deletedCurrentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        const deletedContent = res.data.content || [];
        setDeletedPosts(deletedContent);

        // 페이지가 1 이상이고 현재 페이지에 게시물이 없으면 deletedTotalPages를 1로 설정
        const pages = res.data.totalPages;
        setDeletedTotalPages(deletedContent.length > 0 ? pages : 1);

        // 게시물이 없으면 deletedCurrentPage를 0으로 초기화
        if (deletedContent.length === 0 && deletedCurrentPage > 0) {
          setDeletedCurrentPage(0);
        }
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
  }, [no, currentPage, deletedCurrentPage, showTrash]);

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
          axios.delete(`/api/posts/soft-delete/${postNo}`)
        )
      );
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
        selectedPosts.map((postNo) => axios.put(`/api/posts/restore/${postNo}`))
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
          axios.delete(`/api/posts/permanent-delete/${postNo}`)
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
    if (
      newPage >= 0 &&
      newPage < (showTrash ? deletedTotalPages : totalPages)
    ) {
      if (showTrash) {
        setDeletedCurrentPage(newPage);
      } else {
        setCurrentPage(newPage);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2>내가 쓴 글 목록</h2>

      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
        전체 선택
        <div
          style={{ display: "flex", justifyContent: "flex-end", flexGrow: 1 }}
        >
          {!showTrash ? (
            <>
              <button
                className="btn1Small"
                onClick={handleSoftDeleteSelected}
                disabled={selectedPosts.length === 0}
              >
                선택 삭제
              </button>
              <div
                style={{ marginLeft: "auto", cursor: "pointer" }}
                onClick={() => setShowTrash(true)}
              >
                <MdDeleteForever size={30} color={"#df919e"} />
                <br /> 휴지통 보기
              </div>
            </>
          ) : (
            <>
              <button
                className="btn1Small"
                onClick={handleRestoreSelected}
                disabled={selectedPosts.length === 0}
              >
                선택 복구
              </button>
              <button
                className="btn1Small"
                onClick={handlePermanentDeleteSelected}
                disabled={selectedPosts.length === 0}
              >
                영구 삭제
              </button>
              <div
                style={{ marginLeft: "auto", cursor: "pointer" }}
                onClick={() => setShowTrash(false)}
              >
                <FaBorderAll size={30} color={"#df919e"} />
                <br /> 전체 보기
              </div>
            </>
          )}
        </div>
      </div>

      {!showTrash ? (
        <>
          {userPosts.length > 0 ? (
            userPosts.map((up) => (
              <div key={up.no} className={styles.postContainer}>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(up.no)}
                  onChange={() => handleCheckboxChange(up.no)}
                />
                <Link
                  to={`/user/style/detail/${up.no}`}
                  className={styles.postContent}
                >
                  <img src={up.pic} alt={up.no} />
                  <p>
                    {up.content.length > 50
                      ? `${up.content.slice(0, 50)}...`
                      : up.content}
                  </p>
                </Link>
              </div>
            ))
          ) : (
            <p>게시물이 없습니다.</p>
          )}

          {totalPages > 1 && userPosts.length > 0 && (
            <div className="pagination">
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
          <h2>휴지통</h2>
          <div style={{ textAlign: "center" }}>
            휴지통에 있는 게시글은 작성자 외 다른 회원은 볼 수 없습니다.
            <br />
            복구하거나 영구적으로 삭제할 수 있어요.
          </div>

          <hr />
          {deletedPosts.length > 0 ? (
            deletedPosts.map((post) => (
              <div key={post.no} className={styles.postContainer}>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.no)}
                  onChange={() => handleCheckboxChange(post.no)}
                />
                <div className={styles.postContentWrapper}>
                  <img
                    src={post.pic}
                    alt={`${post.no}`}
                    className={styles.postImage}
                  />
                  <p className={styles.postContent}>
                    {post.content.length > 50
                      ? `${post.content.slice(0, 50)}...`
                      : post.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noPostsMessage}>휴지통이 비어 있습니다.</p>
          )}
          {deletedTotalPages > 1 && deletedPosts.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(deletedCurrentPage - 1)}
                disabled={deletedCurrentPage === 0}
              >
                이전
              </button>
              <span>
                {deletedCurrentPage + 1} / {deletedTotalPages}
              </span>
              <button
                onClick={() => handlePageChange(deletedCurrentPage + 1)}
                disabled={deletedCurrentPage + 1 >= deletedTotalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
