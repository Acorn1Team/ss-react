import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";

const DeleteForm = () => {
  const { userNo } = useParams();
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false); // 모달 창 상태 관리
  const nv = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleDelete = async () => {
    try {
      const response = await axios.put(`/user/mypage/delete`, {
        userNo: userNo,
        password: pass,
      });

      if (response.data.result) {
        setShowModal(true); // 탈퇴 확인 모달 창 표시
      } else {
        if (response.data.message) {
          setErrors({ message: response.data.message }); // 에러 메시지 설정
        }
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    }

    try {
      const res = await axios.get(`/posts/user/${userNo}`);

      if (res.data.idK) {
        let kakaoTokenValue = sessionStorage.getItem("token_k");

        axios
          .post(
            "https://kapi.kakao.com/v1/user/unlink",
            {
              target_id_type: "user_id",
              target_id: sessionStorage.getItem("id"),
            },
            {
              headers: {
                Authorization: `Bearer ${kakaoTokenValue}`,
              },
            }
          )
          .then((res) => {
            if (res.data) {
              console.log(res.data);
              sessionStorage.removeItem("token_k");
              nv("/user");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (res.data.idN) {
        let naverTokenValue = sessionStorage.getItem("token_n");
        axios
          .post(`/api/naver/delete-token`, { naverTokenValue })
          .then((res) => {
            console.log(res.data);
            sessionStorage.removeItem("token_n");
            nv("/user");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleInputChange = (e) => {
    setPass(e.target.value);
  };

  const handleModalConfirm = async () => {
    try {
      setShowModal(false); // 모달 창 닫기
      const response = await axios.delete(`/user/mypage/delete`, {
        data: { userNo },
      });

      if (response.status === 200) {
        nv("/user"); // 성공적으로 삭제되면 홈으로 이동
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false); // 모달 창 닫기
  };

  return (
    <div className={styles.container}>
      <div className={styles.user_input}>
        <input
          type="password"
          name="pass"
          placeholder="비밀번호"
          value={pass}
          onChange={handleInputChange}
        />
        {errors.message && (
          <div className={styles.error_message}>{errors.message}</div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.buttons}>
          <button type="button" onClick={() => setShowModal(true)}>
            회원 탈퇴
          </button>
          <button
            type="button"
            style={{ backgroundColor: "darkgray" }}
            onClick={handleCancel}
          >
            취소
          </button>
        </div>
      </form>

      {/* 모달 창 */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modal_content}>
            <p>정말 탈퇴하시겠습니까?</p>
            <div className={styles.modal_buttons}>
              <button onClick={handleModalConfirm}>확인</button>
              <button onClick={handleModalCancel}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteForm;
