import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NoticeForm() {
  const navigate = useNavigate();

  // 초기 상태값 설정
  const [state, setState] = useState({
    title: "",
    category: "",
    contents: "",
  });

  // 입력 필드 값 변경 시 상태 업데이트
  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  // 추가 버튼 클릭 시 실행되는 함수
  const handleSave = () => {
    // 폼 유효성 검사
    if (!state.title || !state.category || !state.contents) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    // 서버에 데이터 전송
    axios
      .post("/admin/help/notice", state)
      .then((res) => {
        if (res.data.isSuccess) {
          alert("추가 성공");
          navigate("/admin/help/notices");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <h2>공지 추가</h2>
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
                <option value="">선택해주세요</option>
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
      <button onClick={handleSave}>추가</button>
    </>
  );
}
