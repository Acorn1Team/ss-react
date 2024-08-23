import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CommunityManage() {
  const [view, setView] = useState("all"); // "all"은 전체 글, "reported"는 신고 글을 의미
  const [posts, setPosts] = useState([]); // 글 데이터를 저장할 상태

  // 전체 글 데이터를 불러오는 함수
  const fetchPosts = async () => {
    try {
      const response = await axios.get("/admin/posts"); // 백엔드 API 호출
      setPosts(response.data); // 받아온 데이터를 상태에 저장
    } catch (error) {
      console.error("글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 신고된 글 데이터를 불러오는 함수
  const fetchReportedPosts = async () => {
    try {
      const response = await axios.get("/admin/posts/reported"); // 신고된 글을 가져오는 API 호출
      setPosts(response.data); // 받아온 데이터를 상태에 저장
    } catch (error) {
      console.error("신고 글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  // 컴포넌트가 처음 렌더링될 때 데이터 불러옴
  useEffect(() => {
    if (view === "all") {
      fetchPosts(); // 전체 글 보기를 선택했을 때 데이터 불러오기
    } else if (view === "reported") {
      fetchReportedPosts(); // 신고된 글 보기를 선택했을 때 데이터 불러오기
    }
  }, [view]);

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
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (view === "reported") {
      return (
        <div>
          <button onClick={() => setView("all")}>전체보기로 돌아가기</button>
          <h3>신고 글 보기</h3>
          <ul>
            {posts.map((post) => (
              <li key={post.no}>
                <strong>유저 아이디:</strong> {post.userId} <br />
                <strong>글 내용:</strong> {post.content} <br />
                <strong>신고 사유:</strong> {post.category} <br />
                <strong>신고 횟수:</strong> {post.reportsCount} <br />
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
    </div>
  );
}
