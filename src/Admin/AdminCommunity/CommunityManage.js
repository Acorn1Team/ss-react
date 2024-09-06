import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CommunityManage() {
  const [view, setView] = useState("all"); // "all"은 전체 글, "reported"는 신고 글을 의미
  const [sortOrder, setSortOrder] = useState("latest"); // "latest"는 최신보기, "mostReported"는 신고 많은 순 보기
  const [posts, setPosts] = useState([]); // 전체 글 데이터를 저장할 상태
  const [filteredPosts, setFilteredPosts] = useState([]); // 신고된 글 데이터 저장
  const [reportedInfos, setReportedInfos] = useState([]); // 각 filteredPost에 해당하는 신고 내역
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [pageSize] = useState(5); // 한 페이지에 보여줄 게시글 수
  const navigate = useNavigate();

  // 전체 글 데이터를 불러오는 함수
  const fetchPosts = async (page = 0) => {
    try {
      const response = await axios.get(
        `/admin/posts?page=${page}&size=${pageSize}`
      );
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 신고된 글 데이터를 불러오는 함수
  const fetchFilterdPosts = async (page = 0, sort = "latest") => {
    try {
      const response = await axios.get(
        `/admin/posts/reported?page=${page}&size=${pageSize}&sort=${sort}`
      );
      setFilteredPosts(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("신고 글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 신고된 글의 신고내역을 불러오는 함수
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
        setPosts(posts.filter((post) => post.no !== postNo));
        console.log("삭제 성공");
      }
    } catch (error) {
      console.error("신고 글 삭제 중 오류 발생:", error);
    }
  };

  // 컴포넌트가 처음 렌더링될 때 데이터 불러옴
  useEffect(() => {
    if (view === "all") {
      fetchPosts();
    } else if (view === "reported") {
      fetchFilterdPosts(0, sortOrder);
      fetchReportedInfos();
    }
  }, [view, sortOrder]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      if (view === "all") {
        fetchPosts(newPage);
      } else if (view === "reported") {
        fetchFilterdPosts(newPage, sortOrder);
      }
    }
  };

  const renderContent = () => {
    const displayPosts = view === "all" ? posts : filteredPosts;
    return (
      <div>
        <ul className="post-list-horizontal">
          {displayPosts
            .filter((post) => !post.deleted)
            .map((post) => (
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
                <strong>글 내용:</strong> {post.content}
                <br />
                <button
                  onClick={() => navigate(`/user/style/detail/${post.no}`)}
                  className="detail-button"
                >
                  상세보기
                </button>
                &nbsp;&nbsp;
                <button
                  onClick={() => deletePost(post.no)}
                  className="delete-button"
                >
                  삭제하기
                </button>
              </li>
            ))}
        </ul>
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
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 8px;
            margin-right: 10px;
            margin-bottom: 10px; /* 세로 간격 추가 */
            width: 250px; /* 고정된 가로 크기 */
          }

          .image-container {
            text-align: center;
            margin-bottom: 10px;
          }

          .post-image {
            width: 100px;
            height: 100px;
          }

          .delete-button {
            margin-top: 10px;
            padding: 5px 10px;
            background-color: pink;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .detail-button {
            margin-top: 10px;
            padding: 5px 10px;
            margin-left: 10px;
            background-color: skyblue;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .sort-button {
            padding: 5px 10px;
            margin-right: 10px;
            background-color: initial;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
          }

          .sort-button.active {
            background-color: #ccc;
          }
        `}
      </style>
      <div style={{ marginBottom: "10px" }}>
        <button
          style={{ padding: "10px", marginRight: "10px" }}
          onClick={() => setView("all")}
        >
          전체보기
        </button>
        <button style={{ padding: "10px" }} onClick={() => setView("reported")}>
          신고글 보기
        </button>
      </div>
      {renderContent()}
      {totalPages > 1 && (
        <div>
          <button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            이전 페이지
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            disabled={currentPage + 1 === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            다음 페이지
          </button>
        </div>
      )}
    </div>
  );
}
