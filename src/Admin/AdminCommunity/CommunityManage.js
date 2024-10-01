import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";

const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export default function CommunityManage() {
  const [view, setView] = useState("all"); // "all"은 전체 글, "reported"는 신고 글을 의미
  const [sortOrder, setSortOrder] = useState("latest"); // "latest"는 최신보기, "mostReported"는 신고 많은 순 보기
  const [posts, setPosts] = useState([]); // 전체 글
  const [filteredPosts, setFilteredPosts] = useState([]); // 신고된 글
  const [reportedInfos, setReportedInfos] = useState([]); // 각 신고된 게시글의 신고 내역
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [pageSize] = useState(5); // 한 페이지에 보여줄 게시글 수
  const [selectedPosts, setSelectedPosts] = useState([]); // 선택된 게시글들 (배열로 변경)

  const [postToDelete, setPostToDelete] = useState(null); // 삭제할 게시글
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // 상세보기 모달 상태
  const [postToView, setPostToView] = useState(null); // 상세보기할 게시글

  const fetchPosts = async (page = 0) => {
    try {
      const response = await axios.get(
        `/api/admin/posts?page=${page}&size=${pageSize}`
      );

      const { content, totalPages } = response.data;
      const filteredPosts = content.filter((post) => !post.deleted);

      setPosts(filteredPosts);
      setTotalPages(totalPages);
      setCurrentPage(page);
      setSelectedPosts([]); // 초기화
    } catch (error) {
      console.error("글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  const fetchFilteredPosts = async (page = 0, sort = "latest") => {
    try {
      const response = await axios.get(
        `/api/admin/posts/reported?page=${page}&size=${pageSize}&sort=${sort}`
      );

      const filteredPosts = response.data.content.filter(
        (post) => !post.deleted
      );

      setFilteredPosts(filteredPosts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
      setSelectedPosts([]); // 초기화
    } catch (error) {
      console.error("신고 글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  const openDeleteModal = (postData) => {
    setPostToDelete(postData);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (post) => {
    setPostToView(post); // 상세보기할 게시글 저장
    setIsDetailModalOpen(true); // 상세보기 모달 열기
  };

  const fetchReportedInfos = async () => {
    try {
      const response = await axios.get(`/api/admin/posts/reportedInfos`);
      setReportedInfos(response.data);
    } catch (error) {
      console.error("신고 내역을 불러오는 중 오류 발생:", error);
    }
  };

  // 신고 글 삭제 (Backend에서 작성자에게 알림도 전송!)
  const deletePost = async (postNo) => {
    try {
      const response = await axios.delete(`/api/admin/posts/${postNo}`);

      if (response.data.isSuccess) {
        setPosts(posts.filter((post) => post.no !== postNo));
        setFilteredPosts(filteredPosts.filter((post) => post.no !== postNo));
        setSelectedPosts(
          selectedPosts.filter((selected) => selected.no !== postNo)
        );
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("신고 글 삭제 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (view === "all") {
      fetchPosts(currentPage);
    } else if (view === "reported") {
      fetchFilteredPosts(currentPage, sortOrder);
      fetchReportedInfos();
    }
  }, [view, sortOrder, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      setSelectedPosts([]); // 페이지 이동 시 선택된 게시글 초기화
    }
  };

  const renderContent = () => {
    const displayPosts = view === "all" ? posts : filteredPosts;

    const categoryCounts = {};
    reportedInfos.forEach((info) => {
      if (!categoryCounts[info.postNo]) {
        categoryCounts[info.postNo] = {
          욕설: 0,
          홍보: 0,
          선정성: 0,
        };
      }
      categoryCounts[info.postNo][info.category]++;
    });

    return (
      <div id="admin-body">
        <ul className="post-list-horizontal">
          {displayPosts.map((post) => {
            const counts = categoryCounts[post.no] || {
              욕설: 0,
              홍보: 0,
              선정성: 0,
            };

            const displayedCategories = Object.entries(counts)
              .filter(([category, count]) => count > 0)
              .map(([category, count]) => `${category} ${count}회`)
              .join(", ");

            return (
              <li key={post.no} className="post-item">
                <div style={{ textAlign: "center" }}>
                  <button
                    className="delete-button"
                    onClick={() => openDeleteModal(post)}
                  >
                    삭제하기
                  </button>
                </div>
                <hr />
                {view === "reported" && (
                  <>
                    <strong>신고 횟수:</strong> {post.reportsCount}
                    <br />
                    <strong>신고 사유:</strong> {displayedCategories}
                    <hr />
                  </>
                )}
                {post.deleted > 0 && view === "reported" && (
                  <strong>휴지통에 있는 게시물입니다</strong>
                )}
                <strong>작성자:</strong> {post.userNickname}
                <br />
                {post.pic && (
                  <div className="image-container">
                    <img
                      src={post.pic}
                      alt="Post"
                      className="post-image"
                      style={{ display: "block", margin: "0 auto" }}
                    />
                  </div>
                )}
                {truncateText(post.content, 20)}
                <span
                  style={{ cursor: "pointer", color: "blue" }} // 클릭 가능한 스타일 추가
                  onClick={() => openDetailModal(post)} // 상세보기 모달 열기
                >
                  상세보기
                </span>
              </li>
            );
          })}
        </ul>

        {/* 게시글 상세보기 모달 */}
        <Modal
          isOpen={isDetailModalOpen}
          onRequestClose={() => setIsDetailModalOpen(false)}
          contentLabel="게시글 상세보기"
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)", // 배경 흐리게
              display: "flex",
              justifyContent: "center", // 모달을 중앙에 정렬
              alignItems: "center", // 세로 방향 중앙 정렬
            },
            content: {
              background: "white",
              padding: "20px", // 내부 패딩
              borderRadius: "8px",
              textAlign: "center",
              width: "500px", // 모달의 고정 너비
              height: "350px", // 모달의 고정 높이
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between", // 내용을 적절히 배치
              overflowY: "auto", // 내용이 많을 경우 스크롤 허용
            },
          }}
        >
          {postToView && (
            <>
              <h3 style={{ marginBottom: "10px" }}>게시글 상세보기</h3>
              <div
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                  wordBreak: "break-word",
                }}
              >
                <p>{postToView.content}</p> {/* 글 내용 표시 */}
              </div>
              <button
                className="confirm-button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  marginBottom: "0",
                  width: "100px",
                  alignSelf: "center",
                }}
              >
                닫기
              </button>
            </>
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={() => setIsDeleteModalOpen(false)}
          contentLabel="게시글 삭제 확인"
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            content: {
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "400px",
              height: "500px",
              margin: "auto",
            },
          }}
        >
          {postToDelete && (
            <>
              <br />
              <img
                src={postToDelete.pic}
                alt={`${postToDelete.no} 이미지`}
                style={{ maxWidth: "70%", height: "auto" }}
              />
              <br />
              <h3>
                해당 게시글 삭제 조치 후<br /> 작성자에게 경고 알림을
                전송하겠습니다.
              </h3>
              <button
                className="cancel-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                취소
              </button>
              &nbsp;&nbsp;
              <button
                className="confirm-button"
                onClick={() => deletePost(postToDelete.no)}
              >
                확인
              </button>
            </>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <style>
        {`

.post-list-horizontal {
  display: flex;
  justify-content: center;
  list-style-type: none;
  padding: 0;
  flex-wrap: wrap;
}

.post-item {
  position: relative;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-right: 10px;
  margin-bottom: 10px;
  width: 250px;
  height: 350px;
}

.image-container {
  text-align: center;
  margin-bottom: 10px;
}

.post-image {
  height: 150px;
  width: auto;
}

        `}
      </style>
      <div id="admin-body">
        <button
          className={view === "all" ? "button-disabled" : "button-abled"}
          onClick={() => {
            setCurrentPage(0);
            setView("all");
          }}
          disabled={view === "all"}
        >
          전체 글 보기
        </button>
        <button
          className={view === "reported" ? "button-disabled" : "button-abled"}
          onClick={() => {
            setCurrentPage(0);
            setView("reported");
          }}
          disabled={view === "reported"}
        >
          신고된 글 보기
        </button>
        {view === "reported" && (
          <>
            &nbsp;&nbsp;
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ width: "150px" }} // 너비 설정
            >
              <option value="latest">최신순</option>
              <option value="mostReported">신고 많은 순</option>
            </select>
          </>
        )}
      </div>
      {renderContent()}
      <div id="pagination">
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
          disabled={currentPage >= totalPages - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}
