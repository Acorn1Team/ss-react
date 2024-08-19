import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function PostListByUser() {
  const { no } = useParams();
  const [userPosts, setUserPosts] = useState([]);

  const getPostsByUser = () => {
    axios
      .get(`/posts/list/${no}`)
      .then((res) => setUserPosts(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getPostsByUser();
  }, [no]);

  return (
    <>
      {" "}
      {userPosts.map((up) => (
        <div key={up.no}>
          {up.userPic}&emsp;@{up.userNickname}
          <br />
          <Link to={`/user/style/detail/${up.no}`}>
            <b>{up.pic}</b>
            {up.content}
          </Link>
          <hr />
        </div>
      ))}
    </>
  );
}
