import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";

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
  const [verificationCode, setVerificationCode] = useState(""); // 이메일 인증 코드
  const [inputVerificationCode, setInputVerificationCode] = useState(""); // 사용자가 입력한 이메일 인증 코드
  // const [originalEmail, setOriginalEmail] = useState(""); // 원래 이메일
  const [emailChanged, setEmailChanged] = useState(false); // 이메일이 변경되었는지 여부
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordValid, setCurrentPasswordValid] = useState(true);
  const nv = useNavigate();

  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);

  // 이메일 인증 번호 요청 함수
  const sendEmailVerificationCode = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:8080/user/auth/send-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setVerificationCode(result.code); // 서버에서 반환한 인증번호
        alert("인증번호가 이메일로 발송되었습니다.");
      } else {
        setErrors((prev) => ({ ...prev, email: result.message }));
      }
    } catch (error) {
      console.error("인증번호 발송 중 오류 발생:", error);
      setErrors((prev) => ({ ...prev, email: "인증번호 발송 실패" }));
    }
  };

  // 이메일 인증 코드 검증 함수
  const verifyEmailCodeOnServer = async (email, inputCode) => {
    try {
      const response = await fetch(
        "http://localhost:8080/user/auth/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: inputCode }),
        }
      );

      const result = await response.json();
      if (response.ok && result.status === "success") {
        setErrors((prev) => ({
          ...prev,
          email: "인증이 완료되었습니다.",
        }));
        return true; // 인증 성공
      } else {
        setErrors((prev) => ({
          ...prev,
          email: result.message || "인증번호가 일치하지 않습니다.",
        }));
        return false; // 인증 실패
      }
    } catch (error) {
      console.error("인증번호 검증 중 오류 발생:", error);
      setErrors((prev) => ({
        ...prev,
        email: "인증번호 검증 실패",
      }));
      return false; // 오류 발생 시 실패로 처리
    }
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
        if (addrEndRef.current) addrEndRef.current.focus();
      },
    }).open();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id = sessionStorage.getItem("id");
        if (!id) {
          window.location.href = "/loginForm";
          return;
        }
        const response = await axios.get(`/user/update/${userNo}`);
        setUser(response.data);
        setNameNull(response.data.name === null);
        // setSocial(response.data.subpath);

        // 이메일이 변경되었는지 확인
        if (response.data.email !== user.email) {
          setEmailChanged(true);
        }
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

    if (emailChanged && !inputVerificationCode) {
      newErrors.email = "이메일 인증번호를 입력해 주세요.";
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

    if (emailChanged) {
      const isVerified = await verifyEmailCodeOnServer(
        user.email,
        inputVerificationCode
      );
      if (!isVerified) return;
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
      console.log("Sending data to server:", updatedUser);
      const response = await axios.put(`/user/update/${userNo}`, updatedUser);
      console.log("Server response:", response.data);
      alert("회원 정보가 수정되었습니다.");
      window.location.href = "/user/main";
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response ? error.response.data : error.message
      );
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     return;
  //   }

  //   const combinedAddress = combineAddress();

  //   const updatedUser = {
  //     ...user,
  //     address: combinedAddress,
  //     zipcode: user.zipcode,
  //     ...(user.pwd ? { pwd: user.pwd } : {}),
  //     ...(user.addr_end ? { addr_end: user.addr_end } : {}),
  //   };

  //   try {
  //     if (showPasswordForm && currentPassword) {
  //       const passwordResponse = await axios.post(`/user/validate-password`, {
  //         no: userNo, // 사용자 번호도 함께 전달
  //         pwd: currentPassword, // 현재 비밀번호를 전달
  //       });

  //       if (!passwordResponse.data.isValid) {
  //         alert("현재 비밀번호가 일치하지 않습니다.");
  //         return;
  //       }
  //     }

  //     console.log("Sending data to server:", updatedUser);
  //     const response = await axios.put(`/user/update/${userNo}`, updatedUser);
  //     console.log("Server response:", response.data);
  //     alert("회원 정보가 수정되었습니다.");
  //     nv("/user/main");
  //   } catch (error) {
  //     console.error(
  //       "Error updating user:",
  //       error.response ? error.response.data : error.message
  //     );
  //     alert("회원 정보 수정 중 오류가 발생했습니다.");
  //   }
  // };

  const handleCancel = () => {
    window.history.back();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/user/delete/${userNo}`);
      alert("회원 탈퇴가 완료되었습니다.");
      window.location.href = "/loginForm";
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }

    if (user.idK !== null) {
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
    }
    if (user.idN !== null) {
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));

    // 이메일이 변경되었는지 확인
    if (name === "email" && value !== user.email) {
      setEmailChanged(true);
    }
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
      {user.id !== null && <div id={styles.userId}>아이디 : {user.id}</div>}
      {user.idK !== null && <div id={styles.userId}>아이디 : {user.idK}</div>}
      {user.idN !== null && <div id={styles.userId}>아이디 : {user.idN}</div>}
      {/* <div id={styles.userId}>아이디 : {user.id}</div> */}
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
      )}
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
        {errors.name && (
          <div className={styles.error_message}>{errors.name}</div>
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
          <button type="button" onClick={handlePasswordCancel}>
            비밀번호 변경 취소
          </button>
        </>
      )}
      {!showPasswordForm &&
        user.id !== null &&
        (user.idK === null || user.idN === null) && (
          <button type="button" onClick={handlePasswordToggle}>
            비밀번호 변경
          </button>
        )}
      <form onSubmit={handleSubmit}>
        {/* Email 인증 코드 요청 및 검증 */}
        <div className={styles.email_input}>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={(e) => handleInputChange(e)}
            readOnly={user.idK !== null || user.idN !== null}
          />
          {emailChanged && (
            <>
              <button
                type="button"
                className={styles.register_button}
                onClick={() => sendEmailVerificationCode(user.email)}
              >
                인증번호 받기
              </button>
              <input
                type="text"
                placeholder="인증번호 입력"
                value={inputVerificationCode}
                onChange={(e) => setInputVerificationCode(e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  verifyEmailCodeOnServer(user.email, inputVerificationCode)
                }
              >
                인증하기
              </button>
            </>
          )}
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
        <div className={styles.user_input}>
          <input
            type="text"
            ref={zipcodeDisplayRef}
            name="zipcode"
            placeholder="우편번호"
            value={user.zipcode}
            disabled
          />
          <button type="button" onClick={openDaumPostcode}>
            주소 검색
          </button>
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
          <input
            type="text"
            ref={addrEndRef}
            name="addr_end"
            placeholder="상세주소"
            value={user.addr_end}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" onClick={handleSubmit}>
            저장
          </button>
          <button type="button" onClick={handleCancel}>
            취소
          </button>
          <button type="button" onClick={handleDelete}>
            회원 탈퇴
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;
