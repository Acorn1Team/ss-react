import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Archive() {
  const [posts, setPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 로그인된 사용자의 ID
  const userNo = 3; // 이 값은 실제로는 로그인 상태에서 가져와야 합니다.

  useEffect(() => {
    // 활성화된 게시물 가져오기
    axios
      .get(`/api/posts/list/${userNo}`)
      .then((response) => {
        setPosts(response.data.content);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching active posts:", error));

    // 삭제된 게시물 가져오기 (휴지통)
    axios
      .get(`/api/posts/deleted`)
      .then((response) => {
        setDeletedPosts(response.data.content);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching deleted posts:", error));
  }, [userNo]);

  const handleSoftDelete = (postNo) => {
    axios
      .delete(`/api/posts/soft-delete/${postNo}`)
      .then((response) => {
        if (response.data.result) {
          setPosts(posts.filter((post) => post.no !== postNo));
          setDeletedPosts([
            ...deletedPosts,
            posts.find((post) => post.no === postNo),
          ]);
        }
      })
      .catch((error) => console.error("Error soft deleting post:", error));
  };

  const handleRestore = (postNo) => {
    axios
      .put(`/api/posts/restore/${postNo}`)
      .then((response) => {
        if (response.data.result) {
          setDeletedPosts(deletedPosts.filter((post) => post.no !== postNo));
          setPosts([...posts, deletedPosts.find((post) => post.no === postNo)]);
        }
      })
      .catch((error) => console.error("Error restoring post:", error));
  };

  const handlePermanentDelete = (postNo) => {
    axios
      .delete(`/api/posts/permanent-delete/${postNo}`)
      .then((response) => {
        if (response.data.result) {
          setDeletedPosts(deletedPosts.filter((post) => post.no !== postNo));
        }
      })
      .catch((error) =>
        console.error("Error permanently deleting post:", error)
      );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.no}>
            {post.content}
            <button onClick={() => handleSoftDelete(post.no)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Trash (Deleted Posts)</h2>
      <ul>
        {deletedPosts.map((post) => (
          <li key={post.no}>
            {post.content}
            <button onClick={() => handleRestore(post.no)}>Restore</button>
            <button onClick={() => handlePermanentDelete(post.no)}>
              Permanently Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
