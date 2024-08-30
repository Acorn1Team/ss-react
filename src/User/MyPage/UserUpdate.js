import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UserUpdate = () => {
  const { userNo } = useParams(); // userNo를 useParams 내에서 사용

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

  const zipcodeDisplayRef = useRef(null);
  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const userZipcodeRef = useRef(null);

  // Daum API 스크립트 로드
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

  // Daum 주소 검색 API 호출
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

  // DB에서 사용자 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id = sessionStorage.getItem("id");
        if (!id) {
          window.location.href = "/loginForm"; // 로그인 페이지로 리다이렉트
          return;
        }
        const response = await axios.get(`/user/update/${userNo}`);
        setUser(response.data); // 가져온 데이터로 상태 설정
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userNo]); // userNo를 의존성 배열에 추가

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  // 폼 검증 함수
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

  // 주소 병합 함수
  const combineAddress = () => {
    const { addr_start, addr_end } = user;
    if (!addr_start || !addr_end) {
      return "";
    } else {
      return `${addr_start} ${addr_end}`;
    }
  };

  // 폼 제출 핸들러 (DB에 수정된 데이터 저장)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const combinedAddress = combineAddress();
      const updatedUser = {
        ...user,
        address: combinedAddress, // 새로운 주소로 업데이트
        zipcode: user.zipcode, // 우편번호가 포함되도록 확인
      };

      try {
        console.log("Sending data to server:", updatedUser); // 디버깅 로그
        const response = await axios.put(`/user/update/${userNo}`, updatedUser);
        console.log("Server response:", response.data); // 디버깅 로그
        alert("회원 정보가 수정되었습니다.");
        window.location.href = "/user/main"; // 메인 페이지로 리다이렉트
      } catch (error) {
        console.error(
          "Error updating user:",
          error.response ? error.response.data : error.message
        );
        alert("회원 정보 수정 중 오류가 발생했습니다.");
      }
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    window.location.href = "/main"; // 메인 페이지로 리다이렉트
  };

  // 회원 탈퇴 핸들러
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/user/${user.id}`); // 사용자 정보 삭제
      alert("회원 탈퇴가 완료되었습니다.");
      window.location.href = "/loginForm"; // 로그인 페이지로 리다이렉트
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} id="updateForm">
        <div id="userId">@{user.id}</div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="pwd" onChange={handleInputChange} />
          {errors.pwd && <div className="error_message">{errors.pwd}</div>}
        </div>

        <div className="form-group">
          <label>Check</label>
          <input
            type="password"
            name="pwd_chk"
            value={user.pwd_chk}
            onChange={handleInputChange}
          />
          {errors.pwd_chk && (
            <div className="error_message">{errors.pwd_chk}</div>
          )}
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            name="email"
            value={user.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="tel"
            value={user.tel}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Postcode</label>
          <div style={{ display: "flex" }}>
            <input
              type="text"
              name="zipcode"
              value={user.zipcode}
              disabled
              ref={zipcodeDisplayRef}
            />
            <button type="button" onClick={openDaumPostcode}>
              Search
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Current Address</label>
          <input
            type="text"
            name="current_addr"
            value={user.address}
            disabled
          />
        </div>

        <div className="form-group">
          <label>New Address</label>
          <input
            type="text"
            name="addr_start"
            placeholder="도로명/지번 주소"
            value={user.addr_start}
            onChange={handleInputChange}
            ref={addrStartRef}
          />
          <input
            type="text"
            name="addr_end"
            placeholder="상세 주소"
            value={user.addr_end}
            onChange={handleInputChange}
            ref={addrEndRef}
          />
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            수정완료
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            수정취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            회원탈퇴
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;
