import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// 로그인된 유저의 내 작성 글 보기
export default function PostListByUser() {
  // 로그인된 유저의 작성 글 리스트
  const [userPosts, setUserPosts] = useState([]);

  // 선택 삭제를 위한 선택된 글 리스트
  const [selectedPosts, setSelectedPosts] = useState([]);

  // 전체 선택
  const [selectAll, setSelectAll] = useState(false);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  // 로그인 정보라고 가정
  const no = 3;

  // 로그인된 유저가 쓴 글 불러오기
  const getPostsByUser = () => {
    axios
      .get(`/posts/list/${no}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setUserPosts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    getPostsByUser();
  }, [no, currentPage]);

  // 체크 박스 핸들링 함수
  const handleCheckboxChange = (postNo) => {
    // 체크할 때마다 해당 post 번호 가지고 들어옴

    if (selectedPosts.includes(postNo)) {
      // 선택된 포스트 리스트에 해당 포스트 번호가 이미 등록돼 있을 경우
      setSelectedPosts(selectedPosts.filter((id) => id !== postNo));
      // 리스트에서 해당 포스트 번호 제거함 (선택 취소)
    } else {
      // 등록돼 있지 않은 경우
      setSelectedPosts([...selectedPosts, postNo]);
      // 리스트에 해당 포스트 번호 추가함 (선택)
    }
  };

  // 전체 선택 핸들링 함수
  const handleSelectAllChange = () => {
    // 전체 선택 체크박스에 체크할 경우 들어오는 함수
    if (selectAll) {
      // 전체 선택 상태일 경우
      setSelectedPosts([]);
      // 선택된 포스트 리스트 비움
    } else {
      // 전체 선택 상태가 아닐 경우
      setSelectedPosts(userPosts.map((up) => up.no));
      // 선택된 포스트 리스트에 userPosts 를 전부 추가
    }
    setSelectAll(!selectAll);
    // 전체 선택 / 전체 선택 취소 작업 후 selectAll 상태 바꿔 줌
  };

  // 선택 삭제 핸들러 함수
  const handleDeleteSelected = () => {
    axios
      .delete("/posts/delete", {
        data: selectedPosts,
        // 선택된 포스트 리스트를 data 로 가져감
        headers: {
          "Content-Type": "application/json",
          // json 타입임을 명시
        },
      })
      .then((res) => {
        if (res.data.result) {
          // 성공적으로 삭제했을 경우
          getPostsByUser();
          setSelectedPosts([]);
          // 선택된 포스트 리스트 비우기
          setSelectAll(false);
          // 전체 선택 상태 false로 바꾸기
        }
      })
      .catch((err) => {
        console.log("삭제 실패:", err);
      });
  };

  return (
    <>
      <div>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={() => handleSelectAllChange()}
        />
        전체 선택
        <button
          onClick={() => handleDeleteSelected()}
          disabled={selectedPosts.length === 0}
        >
          선택 삭제
        </button>
      </div>
      {userPosts.map((up) => (
        <div key={up.no}>
          <input
            type="checkbox"
            checked={selectedPosts.includes(up.no)}
            // 선택된 포스트 리스트에 해당 포스트가 추가되어 있으면 (true) checked 처리
            onChange={() => handleCheckboxChange(up.no)}
          />
          {up.userPic}&emsp;@{up.userNickname}
          <br />
          <Link to={`/user/style/detail/${up.no}`}>
            <b>{up.pic}</b>
            {up.content}
          </Link>
          <hr />
        </div>
      ))}
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
    </>
  );
}
