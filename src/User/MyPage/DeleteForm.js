import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";
import Modal from "react-modal";
import Loading from "../User/Loading";

const DeleteForm = () => {
  const { userNo } = useParams();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const nv = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const emailCheck = async (email, setErrorMessage) => {
    try {
      const response = await axios.get("/api/user/emailCheck", {
        params: { email }, // 파라미터로 이메일 전달
      });

      console.log("Email Check Response:", response.data); // 응답 확인

      if (response.data.exists) {
        openModal();
      } else {
        setErrorMessage({ email: "이메일이 일치하지 않습니다." });
      }
    } catch (error) {
      setErrorMessage("서버 오류가 발생했습니다.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts/user/${userNo}`);

      if (res.data.idK) {
        let kakaoTokenValue = sessionStorage.getItem("token_k");
        console.log(res.data);
        console.log(res.data.idk);
        await axios.post(
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
        );
        sessionStorage.removeItem("token_k");
      }

      if (res.data.idN) {
        let naverTokenValue = sessionStorage.getItem("token_n");
        await axios.post(`/api/naver/delete-token`, { naverTokenValue });
        sessionStorage.removeItem("token_n");
      }

      const response = await axios.put(`/api/user/mypage/delete`, {
        userNo: userNo,
        email: email,
      });

      if (response.data.result) {
        // openModal();
        //alert("탈퇴가 완료되었습니다.");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("id");
        nv("/user/success/delete");
        //nv("/user");
      } else {
        if (response.data.message) {
          setErrorMessage({ email: "이메일이 일치하지 않습니다." });
        }
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className={styles.container}>
      {loading && <Loading />}
      <div className={styles.user_input}>
        <h2>회원탈퇴</h2>
        <input
          type="text"
          name="pass"
          placeholder="이메일"
          value={email}
          onChange={handleInputChange}
        />
        {errorMessage.email && (
          <div className={styles.error}>{errorMessage.email}</div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.buttons}>
          <input
            value="회원탈퇴"
            className="btn2"
            type="button"
            onClick={() => emailCheck(email, setErrorMessage)}
          ></input>
          <input
            value="취소"
            className="btn3"
            type="button"
            onClick={handleCancel}
          ></input>
        </div>
      </form>

      {/* 모달 창 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="회원 탈퇴 확인"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>회원탈퇴</h2>
        <p>
          탈퇴 시 계정 정보 및 보유중인 포인트와 쿠폰은 삭제되어 복구가
          불가합니다. 정말로 탈퇴하시겠습니까?
        </p>
        <div className={styles.modal_buttons}>
          <input
            type="button"
            className="btn2"
            value="떠날래요ㅠㅠ"
            onClick={handleDelete}
          ></input>
          <input
            type="button"
            className="btn3"
            value="더 써볼래요"
            onClick={closeModal}
          ></input>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteForm;
