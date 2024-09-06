import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Style/PostDetail.module.css"; // CSS 모듈 임포트
import modalStyles from "../Style/PostsModal.module.css"; // 모달 CSS 임포트
import KakaoShareButton from "../Component/KaKaoShareButton";
import { FaReply } from "react-icons/fa";
import "./Posts.css";
export default function Posts() {
  const { postNo } = useParams();
  const navigator = useNavigate();

  const userNo = sessionStorage.getItem("id");

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

  // 태그를 위함
  const [userMap, setUserMap] = useState({});

  // 블라인드 여부
  const [blindCheck, setBlindCheck] = useState(false);

  // 관리자 여부 체크
  const [isAdmin, setIsAdmin] = useState(false);

  // 신고 여부 체크
  const [isReport, setIsReport] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}월 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

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
        if (res.data.posts.reportsCount > 3) {
          setBlindCheck(true);
        }
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

  // 관리자인지 확인하기
  const adminCheck = () => {
    if (userNo === 1) {
      setIsAdmin(true);
    }
  };

  // 인용한 상품 정보 가져오기
  const getProductInPost = () => {
    axios
      .get(`/list/product/${postData.productNo}`)
      .then((res) => {
        setProductData(res.data);
      })
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
            axios.post(`/alert/like/post/${userNo}`, {
              userNo: postData.userNo,
              path: postNo,
              isRead: 0,
            });
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
      let rcm = recommentCheck;

      findParent: while (true) {
        // findParent라는 레이블을 지정
        const parentComment = postCommentData.find((cmt) => cmt.no === rcm);

        if (parentComment) {
          console.log("Current parentComment:", parentComment);

          if (parentComment.parentCommentNo !== null) {
            rcm = parentComment.parentCommentNo;
          } else {
            recomment = parentComment.no;
            break findParent; // 최상위 댓글을 찾았을 때 루프 종료
          }
        } else {
          console.log("Parent comment not found, exiting loop.");
          recomment = recommentCheck;
          break findParent; // parentComment를 찾지 못하면 루프 종료
        }
      }
    }

    console.log("Final recomment value:", recomment);

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
          axios.post(`/alert/reply/post/${userNo}`, {
            userNo: postData.userNo,
            path: postNo,
            isRead: 0,
          });
          if (recomment !== null) {
            axios.post(`/alert/reply/recomment/${userNo}`, {
              userNo: recomment,
              path: postNo,
              isRead: 0,
            });
          }
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
        .delete(`/posts/soft-delete/${postNo}`)
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

  // 신고 여부 확인하기
  const reportCheck = () => {
    axios
      .get(`/posts/report/${userNo}/${postNo}`)
      .then((res) => {
        setIsReport(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
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

  const recomment = (commentUserNo, userNickname) => {
    setCommentContent(`@${userNickname} `);
    setRecommentCheck(commentUserNo);
  };

  const renderCommentContent = (content) => {
    const parts = content.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.slice(1);
        const userNo = userMap[username] || ""; // userMap에서 userNo를 가져옴

        return (
          <Link
            key={index}
            to={`/user/style/profile/${userNo}`}
            className={styles.link}
            style={{ color: "#007bff" }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });

    return parts;
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const backPage = () => {
    window.history.back();
  };

  useEffect(() => {
    getPostDetailInfo();
    getPostLike();
    checkPostLike();
    adminCheck();
    reportCheck();
  }, [postNo, currentPage, pageSize]);

  useEffect(() => {
    if (postData.productNo) {
      getProductInPost();
    }
  }, [postData.productNo]);

  useEffect(() => {
    const map = {};
    postCommentData.forEach((comment) => {
      map[comment.userNickname] = comment.userNo;
    });
    setUserMap(map);
  }, [postCommentData]);

  useEffect(() => {
    if (postCommentData.length) {
      postCommentData.forEach((comment) => {
        getCommentLike(comment.no);
        checkCommentLike(comment.no);
      });
    }
  }, [postCommentData]);

  return (
    <>
      {!blindCheck && (
        <div className={styles.container}>
          <div className={styles.header}>
            <img
              src={userInfo.userPic}
              alt="User Pic"
              className={styles.userPic}
            />
            <div className={styles.userInfo}>
              <Link to={`/user/style/profile/${postData.userNo}`}>
                @{userInfo.userNickname}
              </Link>
              <br />
              {formatDate(postData.date)}
            </div>
            {String(postData.userNo) !== userNo && !isReport && (
              <button
                className={styles.topButtonBox}
                onClick={() => postReports()}
              >
                신고
              </button>
            )}
            &ensp;
            {String(postData.userNo) === String(userNo) && (
              <>
                <button
                  className={styles.topButtonBox}
                  onClick={() => postUDControl("u")}
                >
                  수정
                </button>
                &ensp;
                <button
                  className={styles.topButtonBox}
                  onClick={() => postUDControl("d")}
                >
                  삭제
                </button>
              </>
            )}
            {isAdmin && (
              <button
                className={styles.topButtonBox}
                onClick={() => postUDControl("d")}
              >
                삭제
              </button>
            )}
            &emsp;
            <KakaoShareButton
              title={`${userInfo.userNickname} 님의 포스트 같이 봐요!`}
              description={`${
                postData.content && postData.content.length > 30
                  ? `${postData.content.slice(0, 30)}...`
                  : postData.content || ""
              }`}
              webUrl={`http://192.168.0.12:3000/user/style/detail/${postNo}`}
            />
          </div>
          <div className={styles.postContent}>
            {postData.pic && (
              <img
                src={postData.pic}
                alt="Post Pic"
                className={styles.postImage}
              />
            )}
            <div>{postData.content}</div>
            <div className={styles.actionButtons}>
              {/* 좋아요 버튼을 UI로 교체 */}
              <label class="ui-bookmark">
                <input
                  type="checkbox"
                  checked={postLikeStatus}
                  onChange={() => likeProcHandler()}
                />
                <div class="bookmark">
                  <svg
                    viewBox="0 0 16 16"
                    style={{ marginTop: "4px" }}
                    class="bi bi-heart-fill"
                    height="25"
                    width="25"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </label>
              좋아요 {postLike}개
            </div>
            {postData.productNo && (
              <Link to={`/user/shop/productlist/detail/${productData.no}`}>
                <div className={styles.productInPost}>
                  <img
                    src={productData.pic}
                    alt="Product Pic"
                    className={styles.productImage}
                  />
                  <div>{productData.name}</div>
                  <div>{productData.price}</div>
                </div>
              </Link>
            )}
          </div>
          <hr width="90%" />
          <div className={styles.commentSection}>
            {postCommentData && postCommentData.length > 0 ? (
              <div>
                {postCommentData
                  .filter((pc) => pc.parentCommentNo === null)
                  .map((pc) => (
                    <div key={pc.no} className={styles.comment}>
                      <Link
                        to={`/user/style/profile/${pc.userNo}`}
                        style={{ color: "#007bff", fontWeight: "bold" }}
                      >
                        @{pc.userNickname}
                      </Link>
                      : {renderCommentContent(pc.content)}
                      <span id="iconBox">
                        <span onClick={() => recomment(pc.no, pc.userNickname)}>
                          <FaReply size={"25"} />
                        </span>
                        <span onClick={() => likeProcHandler(pc.no)}>
                          <label class="ui-bookmark">
                            <input
                              type="checkbox"
                              checked={commentLikeStatus[pc.no]}
                              onChange={() => likeProcHandler(pc.no)}
                            />
                            <div class="bookmark">
                              <svg
                                viewBox="0 0 16 16"
                                style={{ marginTop: "4px" }}
                                class="bi bi-heart-fill"
                                height="25"
                                width="25"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                                  fill-rule="evenodd"
                                ></path>
                              </svg>
                            </div>
                          </label>
                        </span>
                        좋아요 {commentLike[pc.no]}개
                      </span>
                      {String(pc.userNo) === String(userNo) && (
                        <button onClick={() => deleteComment(pc.no)}>
                          삭제
                        </button>
                      )}
                      {pc.replies &&
                        pc.replies.map((reply) => (
                          <div key={reply.no} className={styles.reply}>
                            <Link
                              to={`/user/style/profile/${reply.userNo}`}
                              style={{ color: "#007bff" }}
                            >
                              @{reply.userNickname}
                            </Link>
                            : {renderCommentContent(reply.content)} <br />
                            <button
                              onClick={() =>
                                recomment(reply.no, reply.userNickname)
                              }
                            >
                              답글
                            </button>
                            <label class="ui-bookmark">
                              <input
                                type="checkbox"
                                checked={commentLikeStatus[reply.no]}
                                onChange={() => likeProcHandler(reply.no)}
                              />
                              <div class="bookmark">
                                <svg
                                  viewBox="0 0 16 16"
                                  style={{ marginTop: "4px" }}
                                  class="bi bi-heart-fill"
                                  height="25"
                                  width="25"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                                    fill-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            </label>
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
              </div>
            ) : (
              <div>작성된 댓글이 없습니다.</div>
            )}

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
                    value="욕설"
                    checked={reportReason === "욕설"}
                    onChange={handleReportReasonChange}
                  />
                  욕설
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    value="홍보"
                    checked={reportReason === "홍보"}
                    onChange={handleReportReasonChange}
                  />
                  홍보
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    value="선정성"
                    checked={reportReason === "선정성"}
                    onChange={handleReportReasonChange}
                  />
                  선정성
                </label>
                <br />
                <button onClick={submitReport}>신고</button>
                <button onClick={closeReportModal}>취소</button>
              </div>
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                이전
              </button>
              <span style={{ margin: "0 10px" }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}

      {blindCheck && (
        <div className={styles.container}>
          <div className={styles.header}>
            유저 신고로 관리자가 처리 중인 게시글입니다.
            <br />
            <button onClick={() => backPage()}>돌아가기</button>
          </div>
        </div>
      )}
    </>
  );
}
