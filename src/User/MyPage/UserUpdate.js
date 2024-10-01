import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";
import { RiAccountPinCircleFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { SiKakaotalk } from "react-icons/si";
import Modal from "react-modal";

const UserUpdate = () => {
  const { userNo } = useParams();
  const [nameNull, setNameNull] = useState(false);
  const [user, setUser] = useState({
    id: "",
    pwd: "",
    pwd_chk: "",
    name: "",
    email: "",
    tel: "",
    zipcode: "",
    address: "",
    addr_end: "",
    idK: "",
    idN: "",
  });
  const [errors, setErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const nv = useNavigate();
  const [showAddrEnd, setShowAddrEnd] = useState(false); // 상세 주소 입력 필드 표시 여부 관리

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(""); // 모달 내용 관리

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = (mc) => {
    setModalIsOpen(false);
    if (!modalContent.includes("탈퇴")) {
      nv("/user/main");
    }
  };

  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState("");
  const updateErrorMessage = (field, message) => {
    setErrorMessage((prevState) => ({
      ...prevState,
      [field]: message,
    }));
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      window.daum = window.daum || {};
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const openDaumPostcode = useCallback(() => {
    if (!window.daum.Postcode) {
      console.error("Daum Postcode API가 로드되지 않았습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setUser((prevUser) => ({
          ...prevUser,
          address: addr,
          zipcode: data.zonecode,
        }));

        if (zipcodeDisplayRef.current)
          zipcodeDisplayRef.current.value = data.zonecode;
        if (addrStartRef.current) addrStartRef.current.value = addr;
        setShowAddrEnd(true); // 상세 주소 입력 필드 표시
        if (addrEndRef.current) addrEndRef.current.focus();
      },
    }).open();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const token = sessionStorage.getItem("token");
        // const tokenK = sessionStorage.getItem("token_k");
        // const tokenN = sessionStorage.getItem("token_n");
        // if (!token && !tokenK && !tokenN) {
        //   window.location.href = "/user/auth/login";
        //   return;
        // }
        const response = await axios.get(`/api/user/update/${userNo}`);
        setUser(response.data);
        setNameNull(response.data.name === null);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userNo]);

  const validateForm = () => {
    let formIsValid = true;
    let newErrors = {};

    if (showPasswordForm) {
      const userPwdRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,}$/;

      if (user.pwd && !userPwdRegex.test(user.pwd)) {
        newErrors.pwd =
          "비밀번호는 최소 4자, 영문, 숫자, 특수문자를 포함해야 합니다.";
        formIsValid = false;
      }

      if (user.pwd_chk && user.pwd !== user.pwd_chk) {
        newErrors.pwd_chk = "비밀번호가 일치하지 않습니다.";
        formIsValid = false;
      }

      if (!user.pwd && user.pwd_chk) {
        newErrors.pwd = "비밀번호를 입력해 주세요.";
        formIsValid = false;
      }

      if (user.pwd && !user.pwd_chk) {
        newErrors.pwd_chk = "비밀번호 확인을 입력해 주세요.";
        formIsValid = false;
      }
    }

    if (!user.zipcode || !user.address) {
      updateErrorMessage("address", "주소는 필수 입력 항목입니다.");
      formIsValid = false;
    }

    if (!user.name) {
      updateErrorMessage("name", "이름은 필수 입력 항목입니다.");
      formIsValid = false;
    }

    if (!user.tel) {
      updateErrorMessage("tel", "전화번호는 필수 입력 항목입니다.");
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const combineAddress = () => {
    const { address, addr_end } = user;
    return addr_end ? `${address} ${addr_end}` : address;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const combinedAddress = combineAddress();

    const updatedUser = {
      ...user,
      address: combinedAddress,
      zipcode: user.zipcode,
      ...(user.pwd ? { pwd: user.pwd } : {}),
      ...(user.addr_end ? { addr_end: user.addr_end } : {}),
    };

    try {
      if (showPasswordForm && currentPassword) {
        const passwordResponse = await axios.post(`/api/user/validate-password`, {
          no: userNo,
          pwd: currentPassword,
        });

        if (!passwordResponse.data.isValid) {
          updateErrorMessage(
            "currentPassword",
            "현재 비밀번호가 일치하지 않습니다."
          );
          return;
        }
      }

      const response = await axios.put(`/api/user/update/${userNo}`, updatedUser);
      setModalContent("회원 정보가 수정되었습니다.");
      openModal();
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response ? error.response.data : error.message
      );
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleDelete = async () => {
    try {
      console.log("Sending request with userNo:", userNo);
      const response = await axios.get(
        "/api/user/passwordCheck",
        {
          params: { no: userNo },
        }
      );

      console.log("Server response:", response.data); // 서버 응답 확인

      if (response.data === false) {
        setModalContent(
          "주문 처리 중인 상품이 있어 회원 탈퇴를 할 수 없습니다."
        );
        openModal();
      } else {
        nv(`/user/mypage/delete/${userNo}`);
      }
    } catch (error) {
      console.error("회원탈퇴 요청 실패:", error);
      alert("회원 탈퇴 요청에 실패했습니다.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handlePasswordToggle = () => {
    setShowPasswordForm((prev) => !prev);
    if (!showPasswordForm) {
      setUser((prevUser) => ({
        ...prevUser,
        pwd: "",
        pwd_chk: "",
      }));
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    setUser((prevUser) => ({
      ...prevUser,
      pwd: "",
      pwd_chk: "",
    }));
  };

  return (
    <div className={styles.container}>
      <div id={styles.userId}>
        <table>
          <tbody>
            {user.id && (
              <tr>
                <td style={{ border: "none" }}>
                  <RiAccountPinCircleFill />
                </td>
                <td style={{ border: "none" }}>{user.id}</td>
              </tr>
            )}

            {user.idK && (
              <tr>
                <td style={{ border: "none" }}>
                  <SiKakaotalk size={18} color="#f9e000" />
                </td>
                <td style={{ border: "none" }}>{user.idK}</td>
              </tr>
            )}

            {user.idN && (
              <tr>
                <td style={{ border: "none" }}>
                  <SiNaver size={15} color="#03cf5d" />
                </td>
                <td style={{ border: "none" }}>
                  <strong style={{ fontSize: "90%" }}>
                    {user.idN.length > 15
                      ? `${user.idN.substring(0, 15)}...`
                      : user.idN.length}
                  </strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {user.idK !== null && user.id !== null && (
        <div>
          <strong style={{ color: "black" }}>통합 </strong>
          로그인 계정입니다.
        </div>
      )}
      {user.idK !== null && user.id === null && (
        <div>
          <strong style={{ color: "#f9e000" }}>카카오 아이디</strong>로 로그인된
          계정입니다.
        </div>
      )}
      {user.idN !== null && (
        <div>
          <strong style={{ color: "#03cf5d" }}>네이버 아이디</strong>로 로그인된
          계정입니다.
        </div>
      )}{" "}
      <br />
      <div className={styles.user_input}>
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={user.name}
          onChange={handleInputChange}
          disabled={!nameNull}
        />

        {errorMessage.name && (
          <div className={styles.error}>{errorMessage.name}</div>
        )}
      </div>
      {showPasswordForm && (
        <>
          <div className={styles.user_input}>
            <input
              type="password"
              name="currentPassword"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {errors.currentPassword && (
              <div className={styles.error_message}>
                {errors.currentPassword}
              </div>
            )}
          </div>
          <div className={styles.user_input}>
            <input
              type="password"
              name="pwd"
              placeholder="새 비밀번호"
              value={user.pwd}
              onChange={handleInputChange}
            />
            {errors.pwd && (
              <div className={styles.error_message}>{errors.pwd}</div>
            )}
          </div>
          <div className={styles.user_input}>
            <input
              type="password"
              name="pwd_chk"
              placeholder="비밀번호 확인"
              value={user.pwd_chk}
              onChange={handleInputChange}
            />
            {errors.pwd_chk && (
              <div className={styles.error_message}>{errors.pwd_chk}</div>
            )}
          </div>
          <input
            value="비밀번호 변경 취소"
            type="button"
            className={`btn1Long ${styles.buttonn}`}
            onClick={handlePasswordCancel}
            // style={{ backgroundColor: "whitesmoke", color: "black" }}
          ></input>
        </>
      )}
      {!showPasswordForm &&
        user.id !== null &&
        (user.idK === null || user.idN === null) && (
          <input
            type="button"
            value="비밀번호 변경"
            onClick={handlePasswordToggle}
            className={`btn1Long ${styles.buttonn}`}
            // style={{ backgroundColor: "whitesmoke", color: "black" }}
          ></input>
        )}
      <form onSubmit={handleSubmit}>
        <div className={styles.user_input}>
          <input type="text" name="email" value={user.email} disabled />

          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.user_input}>
          <input
            type="text"
            name="tel"
            placeholder="전화번호"
            value={user.tel}
            onChange={handleInputChange}
          />
        </div>
        {errorMessage.tel && <p className={styles.error}>{errorMessage.tel}</p>}
        <div className={styles.user_input}>
          <input
            type="text"
            ref={zipcodeDisplayRef}
            name="zipcode"
            placeholder="우편번호"
            value={user.zipcode}
            disabled
          />

          <input
            type="button"
            value="주소 검색"
            onClick={openDaumPostcode}
            className="btn1Long style"
            // style={{ backgroundColor: "whitesmoke", color: "black" }}
          ></input>
          {errorMessage.address && (
            <p className={styles.error}>{errorMessage.address}</p>
          )}
        </div>
        <div className={styles.user_input}>
          <input
            type="text"
            ref={addrStartRef}
            name="address"
            placeholder="주소"
            value={user.address}
            disabled
          />
          {showAddrEnd && (
            <input
              type="text"
              ref={addrEndRef}
              name="addr_end"
              placeholder="상세 주소"
              onChange={handleInputChange}
              value={user.addr_end || ""}
              style={{ marginTop: "5px" }}
            />
          )}
        </div>
        <div className={styles.buttons}>
          <input
            value="저장"
            type="button"
            className="btn2"
            onClick={handleSubmit}
            //style={{ backgroundColor: "#BE2E22" }}
          ></input>
          <input
            value="취소"
            type="button"
            className="btn2"
            onClick={handleCancel}
          ></input>
          <input
            value="회원탈퇴"
            type="button"
            className="btn3"
            // style={{ backgroundColor: "darkgray" }}
            onClick={handleDelete}
          ></input>
        </div>
      </form>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        // contentLabel="알림"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>{modalContent.includes("탈퇴") ? "회원탈퇴" : "알림"}</h2>
        <p>{modalContent}</p>
        <div className={styles.modal_buttons}>
          <input
            type="button"
            value="확인"
            className="btn4"
            onClick={() => closeModal(modalContent)}
            // style={{ backgroundColor: "darkred" }}
          ></input>
        </div>
      </Modal>
    </div>
  );
};

export default UserUpdate;
