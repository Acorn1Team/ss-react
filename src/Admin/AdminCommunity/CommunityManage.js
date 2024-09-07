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

      const { content, totalElements, totalPages } = response.data;

      const filteredPosts = content.filter((post) => !post.deleted);

      setPosts(filteredPosts);
      setTotalPages(totalPages); 
      setCurrentPage(page);
      setSelectedPost(null);
    } catch (error) {
      console.error("글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  const fetchFilteredPosts = async (page = 0, sort = "latest") => {
    try {
      const response = await axios.get(
        `/admin/posts/reported?page=${page}&size=${pageSize}&sort=${sort}`
      );

      const filteredPosts = response.data.content.filter(
        (post) => !post.deleted
      );

      setFilteredPosts(filteredPosts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
      setSelectedPost(null);
    } catch (error) {
      console.error("신고 글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  const fetchReportedInfos = async () => {
    try {
      const response = await axios.get(`/admin/posts/reportedInfos`);
      setReportedInfos(response.data);
    } catch (error) {
      console.error("신고 내역을 불러오는 중 오류 발생:", error);
    }
  };

  const deletePost = async (postNo) => {
    try {
      const response = await axios.delete(`/admin/posts/${postNo}`);

      if (response.data.isSuccess) {
        setPosts(posts.filter((post) => post.no !== postNo));
        setFilteredPosts(filteredPosts.filter((post) => post.no !== postNo));
        setSelectedPost(null);
        console.log("삭제 성공");
      }
    } catch (error) {
      console.error("신고 글 삭제 중 오류 발생:", error);
    }
  };

  const fetchPostDetail = async (postNo) => {
    try {
      const response = await axios.get(`/admin/posts/detail/${postNo}`);
      setSelectedPost(response.data);
    } catch (error) {
      console.error("게시글 상세 내용을 불러오는 중 오류 발생:", error);
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
      setSelectedPost(null);
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
      <div>
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
                <strong>작성자 ID:</strong> {post.userId}
                <br />
                {post.pic && (
                  <div className="image-container">
                    <strong>사진:</strong>
                    <img
                      src={post.pic}
                      alt="Post"
                      className="post-image"
                      style={{ display: "block", margin: "0 auto" }}
                    />
                  </div>
                )}
                <strong>글 내용:</strong> {truncateText(post.content, 20)}
                <br />
                {view === "reported" && (
                  <>
                    <strong>신고 횟수:</strong> {post.reportsCount}
                    <br />
                    <strong>신고 사유:</strong> {displayedCategories}
                    <br />
                  </>
                )}
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
  justify-content: flex-start;
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
  height: 300px;
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
  margin-top: 10px;
  position: absolute;
  bottom: 10px;
  width: 100%;
}

.button-disabled {
  background-color: rgb(199, 199, 199); /* disabled일 때의 색상 */
  cursor: not-allowed; /* 마우스 포인터를 not-allowed로 변경 */
}

.button-abled {
  background-color: #ebeaea; /* disabled일 때의 색상 */
  color: black;
}

.delete-button,
.detail-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  width: 100px;
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
      <button className={view === "all" ? "button-disabled" : "button-abled"} onClick={() => {setCurrentPage(0); setView("all");}} disabled={view === "all"}>
        전체 글 보기
      </button>
      <button className={view === "reported" ? "button-disabled" : "button-abled"} onClick={() => {setCurrentPage(0); setView("reported")}} disabled={view === "reported"}>
        신고된 글 보기
      </button><br/>
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
