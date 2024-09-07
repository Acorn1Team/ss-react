import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";
import Modal from "react-modal";

const DeleteForm = () => {
  const { userNo } = useParams();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const nv = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  // const passwordCheck = async () => {
  //   try {
  //     const response = await axios.post(`/user/passwordCheck`, {
  //       userNo,
  //       pwd: pass,
  //     });

  //     // 서버에서 응답받은 데이터가 result를 포함하고 있는지 확인
  //     if (response.data.result) {
  //       openModal();
  //     } else {
  //       setErrors({
  //         message: response.data.message,
  //       });
  //     }
  //   } catch (error) {
  //     // error.response가 있는지 확인하고, 상태 코드와 메시지를 로깅
  //     if (error.response) {
  //       setErrors({
  //         message:
  //           error.response.data.message ||
  //           "비밀번호 확인 중 오류가 발생했습니다.",
  //       });
  //     } else {
  //       console.error("비밀번호 확인 중 오류 발생 : ", error.message);
  //       setErrors({ message: "비밀번호 확인 중 오류가 발생했습니다." });
  //     }
  //   }
  // };

  const emailCheck = async (email, setErrorMessage) => {
    try {
      const response = await axios.get("/user/emailCheck", {
        params: { email }, // 파라미터로 이메일 전달
      });

      console.log("Email Check Response:", response.data); // 응답 확인

      if (response.data.exists) {
        openModal();
        // setErrorMessage({ email: "이미 등록된 이메일입니다." });
        // return false;
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
    try {
      const response = await axios.put(`/user/mypage/delete`, {
        userNo: userNo,
        email: email,
      });

      if (response.data.result) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("id");
        alert("탈퇴가 완료되었습니다.");
        nv("/user");
      } else {
        if (response.data.message) {
          setErrorMessage({ email: "이메일이 일치하지 않습니다." });
        }
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    }

    try {
      const res = await axios.get(`/posts/user/${userNo}`);

      if (res.data.idK) {
        let kakaoTokenValue = sessionStorage.getItem("token_k");
        console.log(res.data);
        console.log(res.data.idk);
        // axios
        //   .post(
        //     "https://kapi.kakao.com/v1/user/unlink",
        //     {
        //       target_id_type: "user_id",
        //       target_id: sessionStorage.getItem("id"),
        //     },
        //     {
        //       headers: {
        //         Authorization: `Bearer ${kakaoTokenValue}`,
        //       },
        //     }
        //   )
        //   .then((res) => {
        //     if (res.data) {
        //       console.log(res.data);
        //       sessionStorage.removeItem("token_k");
        //       nv("/user");
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
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
    setEmail(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.user_input}>
        <input
          type="text"
          name="pass"
          placeholder="이메일"
          value={email}
          onChange={handleInputChange}
        />
        {errorMessage.email && (
          <div className={styles.error_message}>{errorMessage.email}</div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={() => emailCheck(email, setErrorMessage)}
          >
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
          <button onClick={handleDelete}>떠날래요 ㅠㅠ</button>
          <button onClick={closeModal}>더 써볼래요</button>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteForm;
