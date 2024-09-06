import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";
import styled from "styled-components";
import { RiAccountPinCircleFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { SiKakaotalk } from "react-icons/si";

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

  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);

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
        // const token = sessionStorage.getItem("token");
        // const tokenK = sessionStorage.getItem("token_k");
        // const tokenN = sessionStorage.getItem("token_n");
        // if (!token && !tokenK && !tokenN) {
        //   window.location.href = "/user/auth/login";
        //   return;
        // }
        const response = await axios.get(`/user/update/${userNo}`);
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
        const passwordResponse = await axios.post(`/user/validate-password`, {
          no: userNo, // 사용자 번호도 함께 전달
          pwd: currentPassword, // 현재 비밀번호를 전달
        });

        if (!passwordResponse.data.isValid) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            currentPassword: "현재 비밀번호가 일치하지 않습니다.",
          }));
          return; // 비밀번호가 일치하지 않으면 폼 제출 중단
        }
      }

      console.log("Sending data to server:", updatedUser);
      const response = await axios.put(`/user/update/${userNo}`, updatedUser);
      console.log("Server response:", response.data);
      alert("회원 정보가 수정되었습니다.");
      nv("/user/main");
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
        "http://localhost:8080/user/passwordCheck",
        {
          params: { no: userNo },
        }
      );

      console.log("Server response:", response.data); // 서버 응답 확인

      if (response.status === 200) {
        // 주문이 없는 경우 또는 주문완료만 있는 경우
        alert("회원 탈퇴 페이지로 이동합니다.");
        nv(`/user/mypage/delete/${userNo}`);
      } else if (response.status === 403) {
        // 주문 처리 중인 상품이 있는 경우
        alert("주문 처리 중인 상품이 있어 회원 탈퇴를 할 수 없습니다.");
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
                  <strong style={{ fontSize: "90%" }}>{user.idN}</strong>
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
          <button
            type="button"
            onClick={handlePasswordCancel}
            style={{ backgroundColor: "whitesmoke", color: "black" }}
          >
            비밀번호 변경 취소
          </button>
        </>
      )}
      {!showPasswordForm &&
        user.id !== null &&
        (user.idK === null || user.idN === null) && (
          <button
            type="button"
            onClick={handlePasswordToggle}
            style={{ backgroundColor: "whitesmoke", color: "black" }}
          >
            비밀번호 변경
          </button>
        )}
      <form onSubmit={handleSubmit}>
        <div className={styles.email_input}>
          <input
            type="email"
            name="email"
            value={user.email}
            disabled
            //readOnly={user.idK !== null || user.idN !== null}
          />

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
          <button
            type="button"
            onClick={openDaumPostcode}
            style={{ backgroundColor: "whitesmoke", color: "black" }}
          >
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
          <button
            type="button"
            onClick={handleSubmit}
            //style={{ backgroundColor: "#BE2E22" }}
          >
            저장
          </button>
          <button type="button" onClick={handleCancel}>
            취소
          </button>
          {/* <Link to={`/user/mypage/delete/${userNo}`}> */}
          <button
            type="button"
            style={{ backgroundColor: "darkgray" }}
            onClick={handleDelete}
          >
            회원 탈퇴
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;
