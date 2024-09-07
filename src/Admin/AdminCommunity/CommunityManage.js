import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 문자열을 잘라주는 함수
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export default function CommunityManage() {
  const [view, setView] = useState("all"); // "all"은 전체 글, "reported"는 신고 글을 의미
  const [sortOrder, setSortOrder] = useState("latest"); // "latest"는 최신보기, "mostReported"는 신고 많은 순 보기
  const [posts, setPosts] = useState([]); // 전체 글 데이터를 저장할 상태
  const [filteredPosts, setFilteredPosts] = useState([]); // 신고된 글 데이터 저장
  const [reportedInfos, setReportedInfos] = useState([]); // 각 신고된 게시글의 신고 내역
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [pageSize] = useState(5); // 한 페이지에 보여줄 게시글 수
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 게시글의 상세 내용
  const navigate = useNavigate();

  const fetchPosts = async (page = 0) => {
    try {
      const response = await axios.get(
        `/admin/posts?page=${page}&size=${pageSize}`
      );

      // 서버에서 삭제되지 않은 게시물 개수와 페이지 수를 받아옴
      const { content, totalElements, totalPages } = response.data;

      // 삭제되지 않은 게시물만 필터링
      const filteredPosts = content.filter((post) => !post.deleted);

      setPosts(filteredPosts);
      setTotalPages(totalPages); // 서버에서 계산된 총 페이지 수
      setCurrentPage(page);
      setSelectedPost(null); // 페이지 변경 시 상세 내용 초기화
    } catch (error) {
      console.error("글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 신고된 글 데이터를 불러오는 함수
  const fetchFilteredPosts = async (page = 0, sort = "latest") => {
    try {
      const response = await axios.get(
        `/admin/posts/reported?page=${page}&size=${pageSize}&sort=${sort}`
      );

      // 삭제되지 않은 신고 글만 필터링
      const filteredPosts = response.data.content.filter(
        (post) => !post.deleted
      );

      setFilteredPosts(filteredPosts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
      setSelectedPost(null); // 페이지 변경 시 상세 내용 초기화
    } catch (error) {
      console.error("신고 글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 신고된 글의 신고 내역을 불러오는 함수
  const fetchReportedInfos = async () => {
    try {
      const response = await axios.get(`/admin/posts/reportedInfos`);
      setReportedInfos(response.data);
    } catch (error) {
      console.error("신고 내역을 불러오는 중 오류 발생:", error);
    }
  };

  // 신고글 삭제 함수
  const deletePost = async (postNo) => {
    try {
      const response = await axios.delete(`/admin/posts/${postNo}`);

      if (response.data.isSuccess) {
        // 삭제 성공시 상태에서 해당 게시물 제거
        setPosts(posts.filter((post) => post.no !== postNo));
        setFilteredPosts(filteredPosts.filter((post) => post.no !== postNo));
        setSelectedPost(null); // 삭제 후 상세 내용 초기화
        console.log("삭제 성공");
      }
    } catch (error) {
      console.error("신고 글 삭제 중 오류 발생:", error);
    }
  };

  // 게시글 상세 내용 가져오는 함수
  const fetchPostDetail = async (postNo) => {
    try {
      const response = await axios.get(`/admin/posts/detail/${postNo}`);
      setSelectedPost(response.data); // 선택된 게시글의 상세 내용 설정
    } catch (error) {
      console.error("게시글 상세 내용을 불러오는 중 오류 발생:", error);
    }
  };

  // 컴포넌트가 처음 렌더링될 때 데이터 불러옴
  useEffect(() => {
    if (view === "all") {
      fetchPosts(currentPage); // 전체 글 보기에서 삭제된 글을 제외하고 가져옴
    } else if (view === "reported") {
      fetchFilteredPosts(currentPage, sortOrder); // 신고된 글 보기에서 삭제된 글을 제외하고 가져옴
      fetchReportedInfos();
    }
  }, [view, sortOrder, currentPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 페이지 번호 상태를 업데이트
      setSelectedPost(null); // 페이지 변경 시 상세 내용 초기화
    }
  };

  const renderContent = () => {
    const displayPosts = view === "all" ? posts : filteredPosts;

    // 신고 카테고리별 카운트를 저장하기 위한 객체
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
      <div>
        <ul className="post-list-horizontal">
          {displayPosts.map((post) => {
            const counts = categoryCounts[post.no] || {
              욕설: 0,
              홍보: 0,
              선정성: 0,
            };

            // 카운트가 0이 아닌 항목만 표시하도록 필터링
            const displayedCategories = Object.entries(counts)
              .filter(([category, count]) => count > 0)
              .map(([category, count]) => `${category} ${count}회`)
              .join(", ");

            return (
              <li key={post.no} className="post-item">
                <strong>작성자 ID:</strong> {post.userId}
                <br />
                {view === "reported" && (
                  <>
                    <strong>신고 횟수:</strong> {post.reportsCount}
                    <br />
                    <strong>신고 사유:</strong> {displayedCategories}
                    <br />
                  </>
                )}
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
                <strong>글 내용:</strong> {truncateText(post.content, 12)}
                {post.deleted > 0 && view === "reported" && (
                  <strong>휴지통에 있는 게시물입니다</strong>
                )}
                <div className="button-container">
                  <button
                    onClick={() => fetchPostDetail(post.no)}
                    className="detail-button"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() => deletePost(post.no)}
                    className="delete-button"
                  >
                    삭제하기
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        {/* 선택된 게시글의 상세 내용 표시 */}
        {selectedPost && (
          <div className="post-detail">
            <h3>상세 내용</h3>

            <strong>글 내용:</strong>
            <p>{selectedPost.content}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <style>
        {`
          .post-list-horizontal {
  display: flex;
  justify-content: flex-start; /* 게시글을 왼쪽 정렬 */
  list-style-type: none;
  padding: 0;
  flex-wrap: wrap; /* 화면 크기에 따라 줄바꿈 허용 */
}

.post-item {
  position: relative; /* 버튼의 절대 위치를 설정할 수 있도록 상대적 위치 사용 */
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-right: 10px;
  margin-bottom: 10px; /* 세로 간격 추가 */
  width: 250px; /* 고정된 가로 크기 */
  height: 300px; /* 고정된 세로 크기 */
}

.image-container {
  text-align: center;
  margin-bottom: 10px;
}

.post-image {
  width: 100px;
  height: 100px;
}

.button-container {
  display: flex;
  
  margin-top: 10px; /* 버튼과 게시글 내용 사이의 간격 */
  position: absolute;
  bottom: 10px; /* 카드의 아래쪽에 버튼 배치 */
  width: 100%; /* 버튼 컨테이너가 카드 너비에 맞게 확장 */
}

.delete-button,
.detail-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px; /* 글꼴 크기 통일 */
  font-weight: bold;
  width: 100px; /* 버튼의 너비를 고정하여 크기 일관되게 설정 */
}

.delete-button {
  background-color: pink;
}

.detail-button {
  background-color: lightblue;
}

.post-detail {
  border-top: 1px solid #ccc;
  padding-top: 20px;
  margin-top: 20px;
}

.post-detail img {
  width: 100px;
  height: 100px;
}

        `}
      </style>
      <h1>게시글 관리</h1>
      <button onClick={() => setView("all")}>전체 글 보기</button>
      <button onClick={() => setView("reported")}>신고된 글 보기</button>
      {view === "reported" && (
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="latest">최신순</option>
          <option value="mostReported">신고 많은 순</option>
        </select>
      )}
      {renderContent()}
      <div>
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
