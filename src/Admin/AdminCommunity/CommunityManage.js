import axios from "axios";
import React, { useEffect, useState } from "react";

export default function CommunityManage() {
  const [view, setView] = useState("all"); // "all"은 전체 글, "reported"는 신고 글을 의미
  const [sortOrder, setSortOrder] = useState("latest"); // "latest"는 최신보기, "mostReported"는 신고 많은 순 보기
  const [posts, setPosts] = useState([]); // 글 데이터를 저장할 상태
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  // 전체 글 데이터를 불러오는 함수
  const fetchPosts = async (page = 0) => {
    try {
      const response = await axios.get(`/admin/posts?page=${page}&size=10`); // 백엔드 API 호출
      setPosts(response.data.content); // 받아온 데이터를 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
      setCurrentPage(response.data.number); // 현재 페이지 번호 저장
    } catch (error) {
      console.error("글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 신고된 글 데이터를 불러오는 함수
  const fetchReportedPosts = async (page = 0, sort = "latest") => {
    try {
      const response = await axios.get(
        `/admin/posts/reported?page=${page}&size=10&sort=${sort}`
      ); // 신고된 글을 가져오는 API 호출, sort 파라미터 추가
      setPosts(response.data.content); // 받아온 데이터를 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
      setCurrentPage(response.data.number); // 현재 페이지 번호 저장
    } catch (error) {
      console.error("신고 글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // userId 기반 신고글 삭제 함수
  const deletePost = async (postNo) => {
    try {
      const response = await axios.delete(`/admin/posts/${postNo}`);

      if (response.data.isSuccess) {
        // 성공적으로 삭제된 경우 목록에서 해당 항목을 제거
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
      fetchPosts(); // 전체 글 보기를 선택했을 때 데이터 불러오기
    } else if (view === "reported") {
      fetchReportedPosts(0, sortOrder); // 신고된 글 보기를 선택했을 때 데이터 불러오기
    }
  }, [view, sortOrder]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (view === "all") {
      fetchPosts(newPage);
    } else if (view === "reported") {
      fetchReportedPosts(newPage, sortOrder);
    }
  };

  const renderContent = () => {
    if (view === "all") {
      return (
        <div>
          <h3>전체 글 보기</h3>
          <ul>
            {posts.map((post) => (
              <li key={post.no}>
                <strong>유저 아이디:</strong> {post.userId} <br />
                {post.pic && (
                  <>
                    <strong>사진:</strong>
                    <img
                      src={post.pic}
                      alt="Post"
                      style={{ width: "100px", height: "100px" }}
                    />
                    <br />
                  </>
                )}
                <strong>글 내용:</strong> {post.content}
                <button onClick={() => deletePost(post.no)}>삭제하기</button>
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (view === "reported") {
      return (
        <div>
          <h3>신고 글 보기</h3>
          <div style={{ marginBottom: "10px" }}>
            <button
              style={{
                padding: "5px 10px",
                marginRight: "10px",
                backgroundColor: sortOrder === "latest" ? "#ccc" : "initial",
              }}
              onClick={() => setSortOrder("latest")}
            >
              최신보기
            </button>
            <button
              style={{
                padding: "5px 10px",
                backgroundColor:
                  sortOrder === "mostReported" ? "#ccc" : "initial",
              }}
              onClick={() => setSortOrder("mostReported")}
            >
              신고 많은 순
            </button>
          </div>
          <ul>
            {posts.map((post) => (
              <li key={post.no}>
                <strong>유저 아이디:</strong> {post.userId} <br />
                <strong>글 내용:</strong> {post.content} <br />
                <strong>신고 사유:</strong> {post.category} <br />
                <strong>신고 횟수:</strong> {post.reportsCount} <br />
                <button
                  onClick={() => deletePost(post.no)}
                  style={{
                    marginTop: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#f00",
                    color: "#fff",
                  }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
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
    </div>
  );
}
