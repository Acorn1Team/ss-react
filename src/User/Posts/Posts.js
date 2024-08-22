import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Style/PostDetail.module.css"; // CSS 모듈 임포트
import modalStyles from "../Style/PostsModal.module.css"; // 모달 CSS 임포트

export default function Posts() {
  const { postNo } = useParams();
  const navigator = useNavigate();

  // 로그인 정보라고 가정
  const userNo = 3;

  // 글 작성자 프로필 사진, 닉네임
  const [userInfo, setUserInfo] = useState({
    userPic: "",
    userNickname: "",
  });

  // 글 정보
  const [postData, setPostData] = useState({});

  // 글 댓글 정보
  const [postCommentData, setPostCommentData] = useState([]);

  // 글 좋아요 정보 및 상태 관리
  const [postLike, setPostLike] = useState(0);
  const [postLikeStatus, setPostLikeStatus] = useState(false);

  // 댓글 좋아요 정보 및 상태 관리
  const [commentLike, setCommentLike] = useState({});
  const [commentLikeStatus, setCommentLikeStatus] = useState({});

  // 인용한 상품 정보
  const [productData, setProductData] = useState({});

  // 댓글 내용
  const [commentContent, setCommentContent] = useState("");

  // 신고 modal 관리
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // 답글 관리
  const [recommentCheck, setRecommentCheck] = useState(0);

  // 현재 페이지를 저장할 상태
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기를 저장할 상태
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수를 저장할 상태
  const [totalPages, setTotalPages] = useState(1);

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 게시글 정보 가져오기
  const getPostDetailInfo = () => {
    setLoading(true);
    axios
      .get(`/posts/detail/${postNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setUserInfo({
          userPic: res.data.userPic,
          userNickname: res.data.userNickname,
        });
        setPostData(res.data.posts);
        setPostCommentData(res.data.comments);
        setTotalPages(res.data.totalPages);
        res.data.comments.forEach((comment) => {
          getCommentLike(comment.no);
          checkCommentLike(comment.no);
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 인용한 상품 정보 가져오기
  const getProductInPost = () => {
    axios
      .get(`/list/product/${postData.productNo}`)
      .then((res) => setProductData(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  // 게시글 좋아요 갯수
  const getPostLike = () => {
    axios
      .get(`/posts/postlike/${postNo}`)
      .then((res) => setPostLike(res.data.result))
      .catch((err) => {
        console.log(err);
      });
  };

  // 댓글 좋아요 갯수
  const getCommentLike = (commentNo) => {
    axios
      .get(`/posts/commentlike/${commentNo}`)
      .then(
        (res) =>
          setCommentLike((pdata) => ({
            ...pdata,
            [commentNo]: res.data.result,
          }))
        // 1 : 3, 2 : 6 같은 형식으로 좋아요 갯수 상태 저장해 두는 것
      )
      .catch((err) => {
        console.log(err);
      });
  };

  // 게시글 좋아요 여부 체크
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

  // 댓글 좋아요 여부 체크
  const checkCommentLike = (commentNo) => {
    axios
      .get(`/posts/commentlike/check/${commentNo}/${userNo}`)
      .then((res) => {
        if (res.data.result) {
          setCommentLikeStatus((pdata) => ({
            ...pdata,
            [commentNo]: res.data.result,
          }));
          // 1 : true, 2 : false 같은 형식으로 좋아요 여부 상태 저장해 두는 것
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 게시글 좋아요 / 좋아요 취소 작업
  const postLikeProc = () => {
    if (postLikeStatus) {
      // 게시글 좋아요 등록된 상태인 경우
      axios
        .delete(`/posts/postlike/${postNo}/${userNo}`)
        // 좋아요 취소
        .then((res) => {
          if (res.data.result === true) {
            setPostLikeStatus(false);
            getPostLike();
            // 게시글 좋아요 상태 다시 불러오기
          }
        })
        .catch((error) => {
          console.log("좋아요 취소 실패 :", error);
        });
    } else {
      // 게시글 좋아요 등록되지 않은 경우
      axios
        .post("/posts/postlike", {
          // 좋아요 등록
          postNo: postNo,
          userNo: userNo,
        })
        .then((res) => {
          if (res.data.result === true) {
            setPostLikeStatus(true);
            getPostLike();
            // 게시글 좋아요 상태 다시 불러오기
          }
        })
        .catch((error) => {
          console.log("좋아요 실패 :", error);
        });
    }
  };

  // 댓글 좋아요
  const commentLikeProc = (commentNo) => {
    if (commentLikeStatus[commentNo]) {
      // 댓글 좋아요 여부 확인 후 좋아요 / 좋아요 취소 작업
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

  // 좋아요 핸들링 함수
  const likeProcHandler = (commentNo) => {
    if (commentNo === undefined) {
      // commentNo 없을 경우 게시글 삭제
      postLikeProc();
    } else {
      // commentNo 있을 경우 해당 댓글 삭제
      commentLikeProc(commentNo);
    }
  };

  // 댓글 내용 핸들링 함수
  const handleContentChange = (e) => {
    setCommentContent(e.target.value);
  };

  // 댓글 등록
  const insertComment = () => {
    let recomment = null;
    if (recommentCheck !== 0) {
      recomment = recommentCheck;
    }
    axios
      .post(`/posts/comment`, {
        postNo: postNo,
        userNo: userNo,
        parentCommentNo: recomment,
        content: commentContent,
      })
      .then((res) => {
        if (res.data.result) {
          getPostDetailInfo();
          setCommentContent("");
          setRecommentCheck(0);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 댓글 삭제
  const deleteComment = (commentNo) => {
    axios
      .delete(`/posts/comment/${commentNo}`)
      .then((res) => {
        if (res.data.result) {
          getPostDetailInfo();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 게시글 수정 / 삭제 핸들링 함수
  const postUDControl = (val) => {
    if (val === "d") {
      axios
        .delete(`/posts/detail/${postNo}`)
        .then((res) => {
          if (res.data.result) {
            navigator(`../list/${userNo}`);
          }
        })
        .catch((error) => {
          console.log("삭제 실패 :", error);
        });
    } else if (val === "u") {
      navigator(`../write/edit/${postNo}`);
    }
  };

  // 신고 모달 열기
  const postReports = () => {
    setIsReportModalOpen(true);
  };

  // 신고 모달 닫기
  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  // 신고 사유 핸들러 함수
  const handleReportReasonChange = (e) => {
    setReportReason(e.target.value);
  };

  // 신고 접수하기
  const submitReport = () => {
    axios
      .post("/posts/report", {
        postNo: postNo,
        userNo: userNo,
        category: reportReason,
      })
      .then((res) => {
        if (res.data.result) {
          alert("신고가 접수되었습니다.");
          closeReportModal();
        }
      })
      .catch((err) => {
        console.log("신고 실패 :", err);
      });
  };

  // 답글 달기 버튼 클릭시
  const recomment = (commentUserNo, userNickname) => {
    setCommentContent("@" + userNickname + " ");
    setRecommentCheck(commentUserNo);
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    getPostDetailInfo();
    getPostLike();
    checkPostLike();
  }, [postNo, currentPage, pageSize]);

  useEffect(() => {
    if (postData.productNo) {
      getProductInPost();
    }
  }, [postData.productNo]);

  useEffect(() => {
    if (postCommentData.length) {
      postCommentData.forEach((comment) => {
        getCommentLike(comment.no);
        checkCommentLike(comment.no);
      });
    }
  }, [postCommentData]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={userInfo.userPic} alt="User Pic" className={styles.userPic} />
        <div className={styles.userInfo}>
          <Link to={`/user/style/profile/${postData.userNo}`}>
            @{userInfo.userNickname}
          </Link>
          {postData.date}
        </div>
        {postData.userNo !== userNo && (
          <button onClick={() => postReports()}>신고</button>
        )}
        {postData.userNo === userNo && (
          <>
            <button onClick={() => postUDControl("u")}>수정</button>
            <button onClick={() => postUDControl("d")}>삭제</button>
          </>
        )}
      </div>
      <div className={styles.postContent}>
        {postData.pic && (
          <img src={postData.pic} alt="Post Pic" className={styles.postImage} />
        )}
        <div>{postData.content}</div>
        <div className={styles.actionButtons}>
          <button
            className={styles.actionButton}
            onClick={() => likeProcHandler()}
            disabled={loading}
          >
            {postLikeStatus ? "좋아요 취소" : "좋아요"}
          </button>
          좋아요 {postLike}개
        </div>
        {postData.productNo && (
          <div>
            <b>이 상품이 마음에 들어요!</b>
            <img
              src={productData.pic}
              alt="Product Pic"
              className={styles.productImage}
            />
            <div>{productData.name}</div>
            <div>{productData.price}</div>
          </div>
        )}
      </div>
      <div className={styles.commentSection}>
        <b>댓글</b>
        {postCommentData
          .filter((pc) => pc.parentCommentNo === null)
          .map((pc) => (
            <div key={pc.no} className={styles.comment}>
              <Link to={`/user/style/profile/${pc.userNo}`}>
                @{pc.userNickname}
              </Link>
              : {pc.content} <br />
              <button onClick={() => recomment(pc.no, pc.userNickname)}>
                답글
              </button>
              <button onClick={() => likeProcHandler(pc.no)}>
                {commentLikeStatus[pc.no] ? "좋아요 취소" : "좋아요"}
              </button>
              좋아요 {commentLike[pc.no]}개
              {pc.userNo === userNo && (
                <button onClick={() => deleteComment(pc.no)}>삭제</button>
              )}
              {postCommentData
                .filter((reply) => reply.parentCommentNo === pc.no)
                .map((reply) => (
                  <div key={reply.no} className={styles.reply}>
                    @{reply.userNickname} : {reply.content} <br />
                    <button
                      onClick={() => recomment(pc.no, reply.userNickname)}
                    >
                      답글
                    </button>
                    <button onClick={() => likeProcHandler(reply.no)}>
                      {commentLikeStatus[reply.no] ? "좋아요 취소" : "좋아요"}
                    </button>
                    좋아요 {commentLike[reply.no]}개
                    {reply.userNo === userNo && (
                      <button onClick={() => deleteComment(reply.no)}>
                        삭제
                      </button>
                    )}
                  </div>
                ))}
            </div>
          ))}
        <textarea
          value={commentContent}
          onChange={handleContentChange}
          placeholder="댓글 입력"
        />
        <button
          onClick={insertComment}
          className={styles.submitButton}
          disabled={loading}
        >
          댓글 등록
        </button>
      </div>
      {isReportModalOpen && (
        <div className={modalStyles.modal}>
          <div className={modalStyles["modal-content"]}>
            <h2>신고 사유를 선택하세요</h2>
            <label>
              <input
                type="radio"
                value="스팸"
                checked={reportReason === "스팸"}
                onChange={handleReportReasonChange}
              />
              스팸
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="부적절한 콘텐츠"
                checked={reportReason === "부적절한 콘텐츠"}
                onChange={handleReportReasonChange}
              />
              부적절한 콘텐츠
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="기타"
                checked={reportReason === "기타"}
                onChange={handleReportReasonChange}
              />
              기타
            </label>
            <br />
            <button onClick={submitReport}>신고</button>
            <button onClick={closeReportModal}>취소</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
        >
          이전
        </button>
        <span style={{ margin: "0 10px" }}>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage + 1 >= totalPages || loading}
        >
          다음
        </button>
      </div>
    </div>
  );
}
