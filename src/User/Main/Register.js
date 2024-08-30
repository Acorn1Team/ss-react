import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 정규 표현식
const userPwdRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,}$/; // 최소 4자, 영문, 숫자, 특수문자 포함
const userIdRegex = /^[a-zA-Z0-9]{4,20}$/; // 4~20자의 영문, 숫자만 허용

// 아이디 중복 검사 함수
const idCheck = async (id, setErrorMessage, setIdChecked) => {
  if (!id) {
    setErrorMessage((prev) => ({
      ...prev,
      id: "아이디를 입력하세요.",
    }));
    setIdChecked(false);
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/user/auth/check?id=${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.exists) {
        setErrorMessage((prev) => ({
          ...prev,
          id: "아이디가 이미 사용 중입니다.",
        }));
        setIdChecked(false);
      } else {
        setErrorMessage((prev) => ({
          ...prev,
          id: "사용 가능한 아이디입니다.",
        }));
        setIdChecked(true);
      }
    } else {
      console.error("ID 중복 확인 실패.");
      setIdChecked(false);
    }
  } catch (error) {
    console.error("ID 중복 확인 중 오류 발생:", error);
    setIdChecked(false);
  }
};

// 유효성 검사 함수
const validateForm = ({
  id,
  pwd,
  pwdChk,
  name,
  email,
  emailDomain,
  tel,
  zipcode,
  addrStart,
  addrEnd,
}) => {
  const errors = {};

  if (!userIdRegex.test(id))
    errors.id = "아이디는 4~20자의 영문자와 숫자만 허용됩니다.";
  if (!userPwdRegex.test(pwd))
    errors.pwd =
      "비밀번호는 최소 4자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.";
  if (pwd !== pwdChk) errors.pwdChk = "비밀번호가 일치하지 않습니다.";
  if (!name) errors.name = "이름을 입력하세요.";
  if (!email || !emailDomain) errors.email = "이메일을 입력하세요.";
  if (!tel) errors.tel = "전화번호를 입력하세요.";
  if (!zipcode || !addrStart || !addrEnd) errors.address = "주소를 입력하세요.";

  return errors;
};

// 회원가입 컴포넌트
const Register = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwdChk, setPwdChk] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailDomain, setEmailDomain] = useState(""); // 기본값으로 "0" 설정
  const [isCustomDomain, setIsCustomDomain] = useState(false); // 직접 입력 여부
  const [tel, setTel] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [addrStart, setAddrStart] = useState(""); // 도로명/지번 주소 상태
  const [addrEnd, setAddrEnd] = useState(""); // 상세 주소 상태
  const [errorMessage, setErrorMessage] = useState({});
  const [emailOptions, setEmailOptions] = useState([
    { value: "0", text: "선택하세요" },
    { value: "직접입력", text: "직접입력" },
    { value: "naver.com", text: "naver.com" },
    { value: "google.com", text: "google.com" },
    { value: "hanmail.net", text: "hanmail.net" },
    { value: "nate.com", text: "nate.com" },
    { value: "kakao.com", text: "kakao.com" },
  ]);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [idChecked, setIdChecked] = useState(false); // 아이디 중복 체크 여부

  const navigate = useNavigate();
  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);
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
        setAddrStart(addr);
        setZipcode(data.zonecode);

        if (zipcodeDisplayRef.current)
          zipcodeDisplayRef.current.value = data.zonecode;
        if (addrStartRef.current) addrStartRef.current.value = addr;
        if (addrEndRef.current) addrEndRef.current.focus();
        if (userZipcodeRef.current)
          userZipcodeRef.current.value = data.zonecode;
      },
    }).open();
  };

  const handleEmailDomainChange = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "직접입력") {
      setIsCustomDomain(true);
      setCustomDomainInput(""); // 입력 칸 초기화
      setEmailDomain("직접입력"); // 커스텀 도메인 입력 필드에 빈 문자열로 설정
    } else if (selectedValue === "0") {
      setIsCustomDomain(false);
      setCustomDomainInput(""); // 입력 칸 초기화
      setEmailDomain(""); // 선택 안된 상태를 나타내는 빈 문자열로 설정
    } else {
      setIsCustomDomain(false);
      setCustomDomainInput(""); // 입력 칸 초기화
      setEmailDomain(selectedValue); // 선택된 도메인으로 설정
    }
  };
  useEffect(() => {
    console.log("isCustomDomain:", isCustomDomain);
    console.log("customDomainInput:", customDomainInput);
    console.log("emailDomain:", emailDomain);
  }, [isCustomDomain, customDomainInput, emailDomain]);

  const handleCustomDomainInputChange = (event) => {
    setCustomDomainInput(event.target.value);
  };

  // 회원가입 핸들러
  const handleRegister = async (event) => {
    event.preventDefault();

    // 유효성 검사
    const errors = validateForm({
      id,
      pwd,
      pwdChk,
      name,
      email,
      emailDomain,
      tel,
      zipcode,
      addrStart,
      addrEnd,
    });

    if (Object.keys(errors).length > 0) {
      setErrorMessage(errors);
      return;
    }

    if (!idChecked) {
      setErrorMessage((prev) => ({
        ...prev,
        id: "아이디 중복 체크를 해주세요",
      }));
      return;
    }

    // 요청 데이터
    const registerData = {
      id,
      pwd,
      name,
      tel,
      email: `${email}@${emailDomain}`,
      address: `${addrStart} ${addrEnd}`,
      zipcode,
    };

    try {
      const response = await fetch("http://localhost:8080/user/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`회원가입 요청이 실패했습니다: ${errorText}`);
      }

      await response.json();
      navigate("/"); // 회원가입 성공 시 홈으로 이동
    } catch (error) {
      console.error("회원가입 요청 중 오류 발생:", error);
      setErrorMessage({ global: error.message });
    }
  };

  return (
    <div className="register_Container">
      <form className="register_Form" onSubmit={handleRegister}>
        <h1>회원가입</h1>

        {/* 아이디 */}
        <div className="register_Form">
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <button
            type="button"
            id="idCheck"
            onClick={() => idCheck(id, setErrorMessage, setIdChecked)}
          >
            중복 확인
          </button>
          {errorMessage.id && (
            <div className="error_message">{errorMessage.id}</div>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="user_input">
          <input
            type="password"
            name="pwd"
            placeholder="비밀번호"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          {errorMessage.pwd && (
            <div className="error_message">{errorMessage.pwd}</div>
          )}
        </div>
        <div className="user_input">
          <input
            type="password"
            name="pwd_chk"
            placeholder="비밀번호 재입력"
            value={pwdChk}
            onChange={(e) => setPwdChk(e.target.value)}
          />
          {errorMessage.pwdChk && (
            <div className="error_message">{errorMessage.pwdChk}</div>
          )}
        </div>

        {/* 이름 */}
        <div className="user_input">
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errorMessage.name && (
            <div className="error_message">{errorMessage.name}</div>
          )}
        </div>

        {/* 이메일 */}
        <div className="email_input">
          <input
            type="text"
            name="user_email"
            id="user_email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span id="middle" style={{ margin: "7px" }}>
            @
          </span>
          <input
            type="text"
            name="email_domain"
            id="email_domain"
            value={isCustomDomain ? customDomainInput : emailDomain}
            onChange={handleCustomDomainInputChange}
            disabled={!isCustomDomain}
          />
          <select
            name="email_select"
            id="email_select"
            onChange={handleEmailDomainChange}
            value={emailDomain}
          >
            {emailOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
        {errorMessage.email && (
          <div className="error_message">{errorMessage.email}</div>
        )}

        {/* 전화번호 */}
        <div className="user_input">
          <input
            type="text"
            name="tel"
            id="user_tel"
            placeholder='휴대폰번호(" - " 제외)'
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
          {errorMessage.tel && (
            <div className="error_message">{errorMessage.tel}</div>
          )}
        </div>

        {/* 주소 */}
        <div className="user_input">
          <input
            type="text"
            placeholder="우편번호"
            maxLength="6"
            name="zipcode"
            id="zipcode_display"
            disabled
            ref={zipcodeDisplayRef}
            value={zipcode}
          />
          <button type="button" onClick={openDaumPostcode}>
            Search
          </button>
        </div>
        <input
          type="hidden"
          id="user_zipcode"
          name="zipcode"
          value={zipcode}
          ref={userZipcodeRef}
        />

        <div className="user_input">
          <input
            type="text"
            name="addr_start"
            id="addr_start"
            placeholder="도로명/지번 주소"
            disabled
            ref={addrStartRef}
            value={addrStart}
          />
        </div>
        <div className="user_input">
          <input
            type="text"
            name="addr_end"
            id="addr_end"
            placeholder="상세 주소"
            value={addrEnd}
            onChange={(e) => setAddrEnd(e.target.value)}
          />
        </div>
        {errorMessage.address && (
          <div className="error_message">{errorMessage.address}</div>
        )}
        <input
          type="hidden"
          id="full_addr"
          name="address"
          value={`${addrStart} ${addrEnd}`}
        />

        <button type="submit" className="btnRegister btn-16" id="btnRegister">
          Join Up
        </button>
        {errorMessage.global && (
          <div className="error_message">{errorMessage.global}</div>
        )}
      </form>
    </div>
  );
};

export default Register;
