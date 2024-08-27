import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NoticeDetail() {
  const { no } = useParams(); // URL 파라미터에서 no 값 추출
  const [categoryFilter, setCategoryFilter] = useState(""); // 카테고리 필터링 상태 추가

  // 수정할 정보 state로 관리
  const [state, setState] = useState({
    category: "",
    title: "",
    contents: "",
  });

  const [notices, setNotices] = useState([]); // 필터링된 공지사항 리스트

  useEffect(() => {
    axios
      .get("/admin/help/notice/" + no)
      .then((res) => {
        setState(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // 공지사항 리스트를 가져오는 API 호출
    axios
      .get("/admin/help/notices")
      .then((res) => {
        setNotices(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [no]);

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleSave = () => {
    axios
      .put("/admin/help/notice/" + no, state)
      .then((res) => {
        // 수정 후 목록보기
        if (res.data.isSuccess) navigate("/admin/help/notices");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = (num) => {
    axios
      .delete("/admin/help/notice/" + no)
      .then((res) => {
        // 삭제 후 목록 보기
        if (res.data.isSuccess) navigate("/admin/help/notices");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const filteredNotices = notices.filter(
    (notice) => categoryFilter === "" || notice.category === categoryFilter
  );

  return (
    <>
      <h2>공지 수정</h2>
      <button
        onClick={() => {
          navigate(`/admin/help/notices`);
        }}
      >
        목록보기
      </button>
      <table>
        <tbody>
          <tr>
            <td>제목</td>
            <td>
              <input
                onChange={handleChange}
                type="text"
                name="title"
                value={state.title}
              />
            </td>
          </tr>
          <tr>
            <td>카테고리</td>
            <td>
              <select
                onChange={handleChange}
                name="category"
                value={state.category}
              >
                <option value="주문">주문</option>
                <option value="결제">결제</option>
                <option value="반품/환불">반품/환불</option>
                <option value="배송">배송</option>
                <option value="프로모션/쿠폰">프로모션/쿠폰</option>
                <option value="상품문의">상품문의</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>내용</td>
            <td>
              <textarea
                onChange={handleChange}
                name="contents"
                value={state.contents}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button onClick={handleSave}>수정</button>
      <button onClick={handleDelete}>삭제</button>
    </>
  );
}
