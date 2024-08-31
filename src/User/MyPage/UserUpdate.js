import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";

import axios from "axios";

const UserUpdate = () => {
  const { userNo } = useParams();

  const [social, setSocial] = useState("");

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
    addr_start: "",
    addr_end: "",
  });
  const [errors, setErrors] = useState({});

  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);
  const userZipcodeRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      window.daum = window.daum || {};
    };
    document.head.appendChild(script);
  }, []);

  const openDaumPostcode = () => {
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
          addr_start: addr,
          zipcode: data.zonecode,
        }));

        if (zipcodeDisplayRef.current)
          zipcodeDisplayRef.current.value = data.zonecode;
        if (addrStartRef.current) addrStartRef.current.value = addr;
        if (addrEndRef.current) addrEndRef.current.focus();
        if (userZipcodeRef.current)
          userZipcodeRef.current.value = data.zonecode;
      },
    }).open();
  };

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
        if (response.data.name === null) {
          setNameNull(true);
        }
        setSocial(response.data.subpath);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userNo]);

  const validateForm = () => {
    let formIsValid = true;
    let newErrors = {};

    const userPwdRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,}$/;

    if (!user.pwd) {
      newErrors.pwd = "비밀번호를 입력해주세요.";
      formIsValid = false;
    } else if (!userPwdRegex.test(user.pwd)) {
      newErrors.pwd =
        "비밀번호는 최소 4자, 영문, 숫자, 특수문자를 포함해야 합니다.";
      formIsValid = false;
    }

    if (user.pwd !== user.pwd_chk) {
      newErrors.pwd_chk = "비밀번호가 일치하지 않습니다.";
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const combineAddress = () => {
    const { addr_start, addr_end } = user;
    let address = `${addr_start} ${addr_end}`;

    if (addr_start && addr_end) {
      address = `${addr_start} ${addr_end}`;
    }
    return address;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const combinedAddress = combineAddress();
      const updatedUser = {
        ...user,
        address: combinedAddress,
        zipcode: user.zipcode,
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
    }
  };

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} id="updateForm">
        <div id={styles.userId}>아이디 : {user.id}</div>
        {social === "kakao" && (
          <div>
            <strong style={{ color: "#f9e000" }}>카카오 아이디</strong>로
            로그인된 계정입니다.
          </div>
        )}
        {social === "naver" && (
          <div>
            <strong style={{ color: "##03cf5d" }}>네이버 아이디</strong>로
            로그인된 계정입니다.
          </div>
        )}
        <br />{" "}
        <div className={styles.user_input}>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={user.name}
            onChange={handleInputChange}
            disabled={nameNull ? false : true}
          />
          {errors.name && (
            <div className={styles.error_message}>{errors.name}</div>
          )}
        </div>
        {social === "0" && (
          <>
            <div className={styles.user_input}>
              <input
                type="password"
                name="pwd"
                placeholder="비밀번호"
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
                placeholder="비밀번호 재입력"
                value={user.pwd_chk}
                onChange={handleInputChange}
              />
              {errors.pwd_chk && (
                <div className={styles.error_message}>{errors.pwd_chk}</div>
              )}
            </div>
          </>
        )}
        <div className={styles.email_input}>
          <input
            type="text"
            name="email"
            placeholder="이메일"
            value={user.email}
            onChange={handleInputChange}
            disabled={social === "0" ? false : true}
          />

          {errors.email && (
            <div className={styles.error_message}>{errors.email}</div>
          )}
        </div>
        <div className={styles.user_input}>
          <input
            type="text"
            name="tel"
            placeholder="전화번호"
            value={user.tel}
            onChange={handleInputChange}
          />
          {errors.tel && (
            <div className={styles.error_message}>{errors.tel}</div>
          )}
        </div>
        <hr style={{ border: "#3897f0 solid 1px", opacity: "20%" }} />
        <br />
        <div className={styles.user_input}>
          <input
            type="text"
            name="zipcode"
            ref={zipcodeDisplayRef}
            placeholder="우편번호"
            value={user.zipcode}
            disabled
          />
          <br />
          <button type="button" onClick={openDaumPostcode}>
            주소 찾기
          </button>
        </div>
        <div className={styles.user_input}>
          <input
            type="text"
            name="addr_start"
            ref={addrStartRef}
            placeholder="주소"
            value={user.addr_start}
            disabled
          />
        </div>
        <div className={styles.user_input}>
          <input
            type="text"
            name="addr_end"
            ref={addrEndRef}
            placeholder="상세주소"
            value={user.addr_end}
            onChange={handleInputChange}
          />
          {errors.address && (
            <div className={styles.error_message}>{errors.address}</div>
          )}
        </div>
        <div className={styles.button_group}>
          <button type="submit" className={styles.register_button}>
            수정
          </button>
          <button
            type="button"
            className={styles.register_button}
            onClick={handleCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.register_button}
            onClick={handleDelete}
            style={{ backgroundColor: "darkgray" }}
          >
            탈퇴
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;
