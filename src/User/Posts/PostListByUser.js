import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const no = 3; // 로그인 정보라고 가정

<<<<<<< HEAD
  // 로그인 정보라고 가정
  const no = sessionStorage.getItem("id");

  // 로그인된 유저가 쓴 글 불러오기
=======
>>>>>>> 686ad77 (보현)
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
      .get(`/posts/deleted`)
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
    <>
      <div>
        <button onClick={() => setShowTrash(false)}>내 게시물</button>
        <button onClick={() => setShowTrash(true)}>휴지통</button>
      </div>

      <div>
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
          {userPosts.map((up) => (
            <div key={up.no}>
              <input
                type="checkbox"
                checked={selectedPosts.includes(up.no)}
                onChange={() => handleCheckboxChange(up.no)}
              />
              {up.userPic}&emsp;@{up.userNickname}
              <br />
              <Link to={`/user/style/detail/${up.no}`}>
                <b>{up.pic}</b>
                {up.content}
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
        </>
      ) : (
        <>
          <h2>휴지통 (삭제된 게시물)</h2>
          {deletedPosts.length > 0 ? (
            deletedPosts.map((post) => (
              <div key={post.no}>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.no)}
                  onChange={() => handleCheckboxChange(post.no)}
                />
                {post.content}
                <hr />
              </div>
            ))
          ) : (
            <p>휴지통이 비어 있습니다.</p>
          )}
        </>
      )}
    </>
  );
}
