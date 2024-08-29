import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const idCheck = () => {};

const Register = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwdChk, setPwdChk] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [isCustomDomain, setIsCustomDomain] = useState(false); // 직접 입력 여부
  const [tel, setTel] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [addrStart, setAddrStart] = useState(""); // 도로명/지번 주소 상태
  const [addrEnd, setAddrEnd] = useState(""); // 상세 주소 상태
  const [errorMessage, setErrorMessage] = useState({});
  const [emailOptions, setEmailOptions] = useState([
    { value: "0", text: "선택하세요" },
    { value: "9", text: "직접입력" },
    { value: "naver.com", text: "naver.com" },
    { value: "google.com", text: "google.com" },
    { value: "hanmail.net", text: "hanmail.net" },
    { value: "nate.com", text: "nate.com" },
    { value: "kakao.com", text: "kakao.com" },
  ]);

  const navigate = useNavigate();
  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);
  const userZipcodeRef = useRef(null);

  useEffect(() => {
    // Daum API 스크립트를 동적으로 로드
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      // 스크립트 로드 완료 후 `daum` 객체가 정의됨
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
      oncomplete: function (data) {
        let addr = "";
        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        // 상태 업데이트
        setAddrStart(addr);
        setZipcode(data.zonecode);

        if (zipcodeDisplayRef.current) {
          zipcodeDisplayRef.current.value = data.zonecode;
        }
        if (addrStartRef.current) {
          addrStartRef.current.value = addr;
        }
        if (addrEndRef.current) {
          addrEndRef.current.focus();
        }
        if (userZipcodeRef.current) {
          userZipcodeRef.current.value = data.zonecode; // 우편번호 설정
        }
      },
    }).open();
  };

  const handleEmailDomainChange = (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "9") {
      // 직접입력을 선택한 경우
      setEmailDomain(""); // 입력 칸을 비워두고
      setIsCustomDomain(true); // 입력 칸 활성화
    } else {
      setEmailDomain(selectedValue); // 선택된 도메인으로 설정
      setIsCustomDomain(false); // 입력 칸 비활성화
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    // 유효성 검사
    const errors = {};
    if (!id) errors.id = "아이디를 입력하세요.";
    if (!pwd) errors.pwd = "비밀번호를 입력하세요.";
    if (pwd !== pwdChk) errors.pwdChk = "비밀번호가 일치하지 않습니다.";
    if (!name) errors.name = "이름을 입력하세요.";
    if (!email || !emailDomain) errors.email = "이메일을 입력하세요.";
    if (!tel) errors.tel = "전화번호를 입력하세요.";
    if (!zipcode || !addrStart || !addrEnd)
      errors.address = "주소를 입력하세요.";
    if (Object.keys(errors).length > 0) {
      setErrorMessage(errors);
      return;
    }

    // JSON 형식의 데이터 생성
    const registerData = {
      id,
      pwd,
      name,
      tel,
      email: `${email}@${emailDomain}`,
      address: `${addrStart} ${addrEnd}`, // 도로명/지번 주소와 상세 주소 결합
      zipcode,
    };

    try {
      const response = await fetch("http://localhost:8080/user/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // JSON 형식으로 요청 헤더 설정
        },
        body: JSON.stringify(registerData), // JSON 형식으로 변환하여 요청 본문에 추가
      });

      if (!response.ok) {
        // 응답 상태가 2xx가 아니면 오류 처리
        const errorText = await response.text(); // 서버의 오류 메시지를 텍스트로 받기
        throw new Error(`회원가입 요청이 실패했습니다: ${errorText}`);
      }

      const result = await response.json(); // JSON 응답 파싱

      // 응답에서 필요한 데이터 저장 (로그인 상태에 따라 수정)
      sessionStorage.setItem("token", result.token || "");
      sessionStorage.setItem("id", result.no || "");

      console.log("회원가입 성공, ID : " + result.id);
      navigate("/"); // 회원가입 성공 시 홈으로 이동
    } catch (error) {
      console.error("회원가입 요청 중 오류 발생:", error);
      setErrorMessage({ global: error.message }); // 오류 메시지 표시
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h1>회원가입</h1>

        {/* 아이디 */}
        <div className="user_input">
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <button type="button" id="idCheck" onClick={idCheck}>
            중복체크
          </button>
        </div>
        {errorMessage.id && (
          <div className="error_message">{errorMessage.id}</div>
        )}

        {/* 비밀번호 */}
        <div className="user_input">
          <input
            type="password"
            name="pwd"
            placeholder="비밀번호"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>
        {errorMessage.pwd && (
          <div className="error_message">{errorMessage.pwd}</div>
        )}
        <div className="user_input">
          <input
            type="password"
            name="pwd_chk"
            placeholder="비밀번호 재입력"
            value={pwdChk}
            onChange={(e) => setPwdChk(e.target.value)}
          />
        </div>
        {errorMessage.pwdChk && (
          <div className="error_message">{errorMessage.pwdChk}</div>
        )}

        {/* 이름 */}
        <div className="user_input">
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {errorMessage.name && (
          <div className="error_message">{errorMessage.name}</div>
        )}

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
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)} // 입력 도메인을 업데이트
            disabled={!isCustomDomain} // 직접입력을 선택했을 때만 활성화
          />
          <select
            name="email_select"
            id="email_select"
            onChange={handleEmailDomainChange}
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
        </div>
        {errorMessage.tel && (
          <div className="error_message">{errorMessage.tel}</div>
        )}

        {/* 주소 */}
        <div className="user_input">
          <input
            type="text"
            placeholder="우편번호"
            maxlength="6"
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
            onChange={(e) => setAddrStart(e.target.value)}
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
