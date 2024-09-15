import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Style/FindPass.module.css";
import Loading from "./Loading";
import Modal from "react-modal";

function FindPass() {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState("");
  const updateErrorMessage = (field, message) => {
    setErrors((prevState) => ({
      ...prevState,
      [field]: message,
    }));
  };
  const [loading, setLoading] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    navigate("/user/auth/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    try {
      await axios.post("/password-reset", {
        email,
        id,
      });
      <Loading />;
      openModal();
    } catch (error) {
      updateErrorMessage("fail", "메일 또는 아이디를 확인해주세요");
      // console.error("비밀번호 재설정 요청 실패:", error);
      // alert("비밀번호 재설정 요청에 실패했습니다.");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div>
      {loading && <Loading />}
      <form className={styles["form-container"]} onSubmit={handleSubmit}>
      <h2>비밀번호 찾기</h2>
        <label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
          />
        </label>
        <label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
            required
          />
        </label>
        {errors.fail && <div className={styles.errors}>{errors.fail}</div>}
        <input
          value="임시 비밀번호 요청"
          className="btn1Long"
          type="button"
          onClick={handleSubmit}
        ></input>
      </form>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        // contentLabel="알림"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>알림</h2>
        <p>임시 비밀번호가 전달되었습니다.</p>
        <div className={styles.modal_buttons}>
          <button
            onClick={() => closeModal()}
            style={{ backgroundColor: "#BE2E22" }}
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
}
export default FindPass;
