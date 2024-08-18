import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// 댓글 작성, 수정, 삭제, 신고, 댓글 좋아요순 정렬?
// 상품 인용 글 작성 처리, 답글 처리
export default function Posts() {
  const { postNo } = useParams();

  const [userInfo, setUserInfo] = useState({
    userPic: "",
    userNickname: "",
  });
  const [postData, setPostData] = useState([]);
  const [postCommentData, setPostCommentData] = useState([]);
  const [postLike, setPostLike] = useState(0);
  const [postLikeStatus, setPostLikeStatus] = useState(false);
  const [commentLike, setCommentLike] = useState({});
  const [commentLikeStatus, setCommentLikeStatus] = useState({});

  // 로그인 정보라고 가정
  const userNo = 3;

  const getPostDetailInfo = () => {
    axios
      .get(`/posts/detail/${postNo}`)
      .then((res) => {
        setUserInfo({
          userPic: res.data.userPic,
          userNickname: res.data.userNickname,
        });
        setPostData(res.data.posts);
        setPostCommentData(res.data.comments);
        res.data.comments.forEach((comment) => {
          getCommentLike(comment.no);
          checkCommentLike(comment.no);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getPostLike = () => {
    axios
      .get(`/posts/postlike/${postNo}`)
      .then((res) => setPostLike(res.data.result))
      .catch((err) => {
        console.log(err);
      });
  };

  const getCommentLike = (commentNo) => {
    axios
      .get(`/posts/commentlike/${commentNo}`)
      .then((res) =>
        setCommentLike((pdata) => ({ ...pdata, [commentNo]: res.data.result }))
      )
      .catch((err) => {
        console.log(err);
      });
  };

  const checkPostLike = () => {
    axios
      .get(`/posts/postlike/check/${postNo}/${userNo}`)
      .then((res) => {
        if (res.data.result) {
          setPostLikeStatus(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const checkCommentLike = (commentNo) => {
    axios.get(`/posts/commentlike/check/${commentNo}/${userNo}`).then((res) => {
      if (res.data.result) {
        setCommentLikeStatus((pdata) => ({
          ...pdata,
          [commentNo]: res.data.result,
        }));
      }
    });
  };

  const postLikeProc = () => {
    if (postLikeStatus) {
      axios
        .delete(`/posts/postlike/${postNo}/${userNo}`)
        .then((res) => {
          if (res.data.result === true) {
            setPostLikeStatus(false);
            getPostLike();
          }
        })
        .catch((error) => {
          console.log("좋아요 취소 실패 :", error);
        });
    } else {
      axios
        .post("/posts/postlike", {
          postNo: postNo,
          userNo: userNo,
        })
        .then((res) => {
          if (res.data.result === true) {
            setPostLikeStatus(true);
            getPostLike();
          }
        })
        .catch((error) => {
          console.log("좋아요 실패 :", error);
        });
    }
  };

  const commentLikeProc = (commentNo) => {
    if (commentLikeStatus[commentNo]) {
      axios
        .delete(`/posts/commentlike/${commentNo}/${userNo}`)
        .then((res) => {
          if (res.data.result) {
            setCommentLikeStatus((pstatus) => ({
              ...pstatus,
              [commentNo]: false,
            }));
            getCommentLike(commentNo);
          }
        })
        .catch((error) => {
          console.log("좋아요 취소 실패 :", error);
        });
    } else {
      axios
        .post("/posts/commentlike", {
          commentNo: commentNo,
          userNo: userNo,
        })
        .then((res) => {
          if (res.data.result) {
            setCommentLikeStatus((pstatus) => ({
              ...pstatus,
              [commentNo]: true,
            }));
            getCommentLike(commentNo);
          }
        })
        .catch((error) => {
          console.log("좋아요 실패 :", error);
        });
    }
  };

  const likeProcHandler = (commentNo) => {
    if (commentNo === undefined) {
      postLikeProc();
    } else {
      commentLikeProc(commentNo);
    }
  };

  useEffect(() => {
    getPostDetailInfo();
    getPostLike();
    getCommentLike(1);
    checkPostLike();
    checkCommentLike(1);
  }, [postNo]);

  return (
    <div>
      {userInfo.userPic}&emsp;@{userInfo.userNickname} {postData.date}
      <div id="postBox">
        {postData.pic}
        <br />
        <button onClick={() => likeProcHandler()}>
          {postLikeStatus ? "좋아요 취소" : "좋아요"}
        </button>
        좋아요 {postLike}개 <br />
        {postData.content}
      </div>
      <div id="commentBox">
        <b>댓글</b>
        {postCommentData.map((pc) => (
          <div key={pc.no}>
            @{pc.userNickname} : {pc.content} <br />
            <button onClick={() => likeProcHandler(pc.no)}>
              {commentLikeStatus[pc.no] ? "좋아요 취소" : "좋아요"}
            </button>
            좋아요 {commentLike[pc.no]}개
          </div>
        ))}
      </div>
    </div>
  );
}
