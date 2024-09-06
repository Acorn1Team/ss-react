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
  const [postCommentData, setPostCommentData] = useState([]);
  const [postLike, setPostLike] = useState(0); // 게시글 좋아요 수
  const [postLikeStatus, setPostLikeStatus] = useState(false); // 게시글 좋아요 상태

  // 댓글 관련 상태
  const [commentLike, setCommentLike] = useState({}); // 댓글 좋아요 수
  const [commentLikeStatus, setCommentLikeStatus] = useState({}); // 댓글 좋아요 상태
  const [commentContent, setCommentContent] = useState(""); // 댓글 내용
  const [productData, setProductData] = useState({}); // 인용된 상품 정보
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 신고 모달 상태
  const [reportReason, setReportReason] = useState(""); // 신고 사유
  const [recommentCheck, setRecommentCheck] = useState(0); // 답글 체크
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [pageSize, setPageSize] = useState(5); // 페이지 사이즈
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [userMap, setUserMap] = useState({}); // 유저 태그용 맵
  const [blindCheck, setBlindCheck] = useState(false); // 블라인드 여부
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부
  const [isReport, setIsReport] = useState(false); // 신고 여부

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
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

        // 각 댓글마다 좋아요 수와 상태를 가져옴
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

  // 인용된 상품 정보 가져오기
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

  // 게시글 좋아요 갯수 가져오기
  const getPostLike = () => {
    axios
      .get(`/posts/postlike/${postNo}`)
      .then((res) => setPostLike(res.data.result))
      .catch((err) => {
        console.log(err);
      });
  };

  // 댓글 좋아요 수 가져오기
  const getCommentLike = (commentNo) => {
    axios
      .get(`/posts/commentlike/${commentNo}`)
      .then((res) => {
        // 새로운 값으로 상태 초기화 (누적되지 않도록 처리)
        setCommentLike((prev) => ({
          ...prev,
          [commentNo]: res.data.result, // 댓글의 좋아요 수를 갱신
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 게시글 좋아요 상태 체크
  const checkPostLike = () => {
    axios
      .get(`/posts/postlike/check/${postNo}/${userNo}`)
      .then((res) => {
        if (res.data.result) {
          setPostLikeStatus(true); // 사용자가 이미 좋아요를 눌렀다면 true 설정
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 댓글 좋아요 상태 체크
  const checkCommentLike = (commentNo) => {
    axios
      .get(`/posts/commentlike/check/${commentNo}/${userNo}`)
      .then((res) => {
        // 댓글의 좋아요 상태를 업데이트
        setCommentLikeStatus((prev) => ({
          ...prev,
          [commentNo]: res.data.result,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 게시글 좋아요 / 좋아요 취소
  const postLikeProc = () => {
    if (postLikeStatus) {
      // 이미 좋아요가 눌린 상태라면 좋아요 취소
      axios
        .delete(`/posts/postlike/${postNo}/${userNo}`)
        .then((res) => {
          if (res.data.result === true) {
            setPostLikeStatus(false); // 좋아요 상태를 false로 설정
            setPostLike((prev) => prev - 1); // 좋아요 수 감소
          }
        })
        .catch((error) => {
          console.log("좋아요 취소 실패 :", error);
        });
    } else {
      // 좋아요가 눌리지 않은 상태라면 좋아요 추가
      axios
        .post("/posts/postlike", {
          postNo: postNo,
          userNo: userNo,
        })
        .then((res) => {
          if (res.data.result === true) {
            setPostLikeStatus(true); // 좋아요 상태를 true로 설정
            setPostLike((prev) => prev + 1); // 좋아요 수 증가
          }
        })
        .catch((error) => {
          console.log("좋아요 실패 :", error);
        });
    }
  };

  // 댓글 좋아요 / 좋아요 취소 작업
  const commentLikeProc = (commentNo) => {
    // 이미 좋아요 처리 중인 경우 중복 호출을 방지
    if (loading) return;

    setLoading(true); // 로딩 상태를 true로 설정해 중복 처리 방지

    if (commentLikeStatus[commentNo]) {
      // 이미 좋아요가 눌린 댓글이라면 좋아요 취소
      axios
        .delete(`/posts/commentlike/${commentNo}/${userNo}`)
        .then((res) => {
          if (res.data.result) {
            // 상태를 갱신하여 좋아요 상태를 false로 설정하고 좋아요 수 1 감소
            setCommentLikeStatus((prevStatus) => ({
              ...prevStatus,
              [commentNo]: false,
            }));
            setCommentLike((prevLikes) => ({
              ...prevLikes,
              [commentNo]: Math.max(0, prevLikes[commentNo] - 1), // 최소 0으로 유지
            }));
          }
        })
        .catch((error) => {
          console.log("댓글 좋아요 취소 실패 :", error);
        })
        .finally(() => {
          setLoading(false); // 로딩 상태를 다시 false로 설정
        });
    } else {
      // 좋아요가 눌리지 않은 댓글이라면 좋아요 추가
      axios
        .post("/posts/commentlike", {
          commentNo: commentNo,
          userNo: userNo,
        })
        .then((res) => {
          if (res.data.result) {
            // 상태를 갱신하여 좋아요 상태를 true로 설정하고 좋아요 수 1 증가
            setCommentLikeStatus((prevStatus) => ({
              ...prevStatus,
              [commentNo]: true,
            }));
            setCommentLike((prevLikes) => ({
              ...prevLikes,
              [commentNo]: (prevLikes[commentNo] || 0) + 1, // 누적되지 않도록 1씩 증가
            }));
          }
        })
        .catch((error) => {
          console.log("댓글 좋아요 실패 :", error);
        })
        .finally(() => {
          setLoading(false); // 로딩 상태를 다시 false로 설정
        });
    }
  };

  // 좋아요 처리 핸들러 (게시글 또는 댓글에 따라 다르게 처리)
  const likeProcHandler = (commentNo) => {
    if (commentNo === undefined) {
      // commentNo가 없으면 게시글 좋아요 처리
      postLikeProc();
    } else {
      // commentNo가 있으면 해당 댓글에 대한 좋아요 처리
      commentLikeProc(commentNo);
    }
  };

  const handleContentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const insertComment = () => {
    let recomment = null;
    if (recommentCheck !== 0) {
      let rcm = recommentCheck;

      findParent: while (true) {
        const parentComment = postCommentData.find((cmt) => cmt.no === rcm);
        if (parentComment) {
          if (parentComment.parentCommentNo !== null) {
            rcm = parentComment.parentCommentNo;
          } else {
            recomment = parentComment.no;
            break findParent;
          }
        } else {
          recomment = recommentCheck;
          break findParent;
        }
      }
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
          getPostDetailInfo(); // 댓글 등록 후 게시글 정보 다시 가져오기
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

  const deleteComment = (commentNo) => {
    axios
      .delete(`/posts/comment/${commentNo}`)
      .then((res) => {
        if (res.data.result) {
          getPostDetailInfo(); // 댓글 삭제 후 게시글 정보 다시 가져오기
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  const postReports = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleReportReasonChange = (e) => {
    setReportReason(e.target.value);
  };

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
        const userNo = userMap[username] || "";
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
              {/* 좋아요 버튼 */}
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
