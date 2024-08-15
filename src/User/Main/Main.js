import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UserHome() {
  const [show, setShow] = useState([]);
  const [review, setReview] = useState([]);
  const [posts, setPosts] = useState([]);
  const refresh = () => {
    showData();
    showNewReview();
    showStyleBest();
  };
  const showData = () => {
    axios
      .get("/main/showData")
      .then((res) => {
        setShow(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const showNewReview = () => {
    axios
      .get("/main/showNewReview")
      .then((res) => {
        setReview(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const showStyleBest = () => {
    axios
      .get("/main/showStyleBest")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    refresh();
  }, []);
  return (
    <div>
      <img width="100%" src="../images/mainphoto-01.png" alt="main"></img>
      <b>SceneStealer</b>
      <div id="mainPosts">
        <b className="mainTextTitle">Choose Your Scene!</b>
        {show.map((s) => (
          <Link to={`/user/main/sub/${s.no}`}>
            <div className="mainPostsBox" key={s.no}>
              {s.pic}
              <br />
              {s.title}
            </div>
          </Link>
        ))}
      </div>
      <div id="mainReviews">
        <b className="mainTextTitle">New Review</b>
        {review.map((r) => (
          <Link to={`/user/shop/review/${r.no}`}>
            <div className="mainReviewsBox" key={r.no}>
              {r.pic}
              <br />
              {r.user.nickname}&emsp;{r.product.name}
            </div>
          </Link>
        ))}
      </div>
      <div id="mainReviews">
        <b className="mainTextTitle">Style Best</b>
        <b className="mainTextTitle">New Review</b>
        {posts.map((p) => (
          <Link to={`/user/style/posts/${p.no}`}>
            <div className="mainReviewsBox" key={p.no}>
              {p.pic}&emsp;{p.nickname}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
