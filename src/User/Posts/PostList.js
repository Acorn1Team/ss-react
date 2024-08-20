import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PostList() {
  const [followPost, setFollowPost] = useState([]);
  // 로그인 정보라고 가정
  const userNo = 3;

  useEffect(() => {
    getPostList();
  }, [userNo]);

  // 팔로우한 유저 게시글 정보 가져오기
  const getPostList = () => {
    axios
      .get(`/posts/followPostList/${userNo}`)
      .then((res) => setFollowPost(res.data))
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div>
      {followPost.map((fp) => (
        <div key={fp.no}>
          {fp.userPic}&emsp;
          <Link to={`/user/style/profile/${fp.userNo}`}>
            @{fp.userNickname}
          </Link>
          <br />
          <Link to={`/user/style/detail/${fp.no}`}>
            <b>{fp.pic}</b>
            {fp.content}
          </Link>
        </div>
      ))}
    </div>
  );
}
