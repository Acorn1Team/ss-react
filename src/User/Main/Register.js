import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Style/UserRegister.module.css";

// 정규 표현식
const userPwdRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,}$/; // 최소 4자, 영문, 숫자, 특수문자 포함
const userIdRegex = /^[a-zA-Z0-9]{4,20}$/; // 4~20자의 영문, 숫자만 허용
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // 이메일 형식 검증 정규 표현식

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

// 이메일 인증 번호 요청 함수
const sendEmailVerificationCode = async (
  email,
  setVerificationCode,
  setErrorMessage
) => {
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
      setErrorMessage(result.message); // 서버에서 반환한 에러 메시지
    }
  } catch (error) {
    console.error("인증번호 발송 중 오류 발생:", error);
    setErrorMessage("인증번호 발송 실패");
  }
};
// const sendEmailVerificationCode = async (
//   email,
//   setVerificationCode,
//   setErrorMessage
// ) => {
//   try {
//     const response = await fetch(
//       "http://localhost:8080/user/auth/send-verification-code",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       }
//     );

//     const result = await response.json();
//     if (result.status === "success") {
//       setVerificationCode(result.code); // 서버에서 반환한 인증번호
//       alert("인증번호가 이메일로 발송되었습니다.");
//     } else {
//       setErrorMessage({ email: result.message });
//     }
//   } catch (error) {
//     console.error("인증번호 발송 중 오류 발생:", error);
//     setErrorMessage({ email: "인증번호 발송 실패" });
//   }
// };

// 이메일 인증 코드 검증 함수
const verifyEmailCodeOnServer = async (email, inputCode, setErrorMessage) => {
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
      setErrorMessage((prev) => ({
        ...prev,
        email: "인증이 완료되었습니다.",
      }));
      return true; // 인증 성공
    } else {
      setErrorMessage((prev) => ({
        ...prev,
        email: result.message || "인증번호가 일치하지 않습니다.",
      }));
      return false; // 인증 실패
    }
  } catch (error) {
    console.error("인증번호 검증 중 오류 발생:", error);
    setErrorMessage((prev) => ({
      ...prev,
      email: "인증번호 검증 실패",
    }));
    return false; // 오류 발생 시 실패로 처리
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

  //if (pwd !== pwdChk) errors.pwdChk = "비밀번호가 일치하지 않습니다.";
  if (!name) errors.name = "이름을 입력하세요.";
  if (!email || !emailDomain) errors.email = "이메일을 입력하세요.";
  else if (!emailRegex.test(`${email}@${emailDomain}`))
    errors.email = "올바른 이메일 형식을 입력하세요.";
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
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [idChecked, setIdChecked] = useState(false); // 아이디 중복 체크 여부
  const [verificationCode, setVerificationCode] = useState(""); // 이메일 인증 코드
  const [inputVerificationCode, setInputVerificationCode] = useState(""); // 사용자가 입력한 이메일 인증 코드

  const navigate = useNavigate();
  const addrStartRef = useRef(null);
  const addrEndRef = useRef(null);
  const zipcodeDisplayRef = useRef(null);
  const userZipcodeRef = useRef(null);

  const handlePwdChange = (e) => {
    const newPwd = e.target.value;
    setPwd(newPwd);

    // 비밀번호 유효성 검사
    if (!userPwdRegex.test(newPwd)) {
      setErrorMessage((prevState) => ({
        ...prevState,
        pwd: "비밀번호는 최소 4자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.",
      }));
    } else {
      setErrorMessage((prevState) => ({
        ...prevState,
        pwd: "",
      }));
    }

    // 비밀번호 확인 검사
    if (pwdChk && newPwd !== pwdChk) {
      setErrorMessage((prevState) => ({
        ...prevState,
        pwdChk: "비밀번호가 일치하지 않습니다.",
      }));
    } else {
      setErrorMessage((prevState) => ({
        ...prevState,
        pwdChk: "",
      }));
    }
  };

  const handlePwdChkChange = (e) => {
    setPwdChk(e.target.value);
    if (pwd && e.target.value !== pwd) {
      setErrorMessage((prevState) => ({
        ...prevState,
        pwdChk: "비밀번호가 일치하지 않습니다.",
      }));
    } else {
      setErrorMessage((prevState) => ({
        ...prevState,
        pwdChk: "",
      }));
    }
  };

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
    if (selectedValue === "9") {
      setIsCustomDomain(true);
      setCustomDomainInput(""); // 입력 칸 초기화
      setEmailDomain(""); // 커스텀 도메인 입력 필드에 빈 문자열로 설정
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

  const handleCustomDomainInputChange = (event) => {
    setCustomDomainInput(event.target.value);
    setEmailDomain(event.target.value); // 입력값으로 도메인 업데이트
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

    if (
      !(await verifyEmailCodeOnServer(
        `${email}@${emailDomain}`,
        inputVerificationCode,
        setErrorMessage
      ))
    ) {
      setErrorMessage((prev) => ({
        ...prev,
        email: "이메일 인증이 완료되지 않았습니다.",
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
    <div className={styles.container}>
      <form className="register_Form" onSubmit={handleRegister}>
        <h1>SceneStealer</h1>

        {/* 아이디 */}
        <div className={styles.id_input}>
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
        </div>
        {errorMessage.id && (
          <div className={styles.error_message}>{errorMessage.id}</div>
        )}

        {/* 비밀번호 */}
        <div className={styles.user_input}>
          <input
            type="password"
            name="pwd"
            placeholder="비밀번호"
            value={pwd}
            onChange={handlePwdChange}
          />
          {errorMessage.pwd && (
            <div className={styles.error_message}>{errorMessage.pwd}</div>
          )}
        </div>
        <div className={styles.user_input}>
          <input
            type="password"
            name="pwd_chk"
            placeholder="비밀번호 재입력"
            value={pwdChk}
            onChange={handlePwdChkChange}
          />
          {errorMessage.pwdChk && (
            <div className={styles.error_message}>{errorMessage.pwdChk}</div>
          )}
        </div>

        {/* 이름 */}
        <div className={styles.user_input}>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errorMessage.name && (
            <div className={styles.error_message}>{errorMessage.name}</div>
          )}
        </div>
        <hr />
        {/* 이메일 */}
        <div className={styles.email_input}>
          <input
            type="text"
            name="user_email"
            id="user_email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span id="middle">@</span>
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
          <div className={styles.error_message}>{errorMessage.email}</div>
        )}
        <button
          type="button"
          onClick={() =>
            sendEmailVerificationCode(
              `${email}@${emailDomain}`,
              setVerificationCode,
              setErrorMessage
            )
          }
          disabled={!email || !emailDomain}
        >
          인증번호 발송
        </button>
        <div className={styles.user_input}>
          <label>
            {" "}
            <input
              type="text"
              placeholder="인증번호"
              value={inputVerificationCode}
              onChange={async (e) => {
                const userCode = e.target.value;
                setInputVerificationCode(userCode);
                if (userCode) {
                  await verifyEmailCodeOnServer(
                    `${email}@${emailDomain}`,
                    userCode,
                    setErrorMessage
                  );
                }
              }}
            />
          </label>
        </div>
        <hr />

        {/* 전화번호 */}
        <div className={styles.user_input}>
          <input
            type="text"
            name="tel"
            id="user_tel"
            placeholder='휴대폰번호(" - " 제외)'
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
          {errorMessage.tel && (
            <div className={styles.error_message}>{errorMessage.tel}</div>
          )}
        </div>

        {/* 주소 */}
        <div className={styles.id_input}>
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
            검색
          </button>
        </div>
        <input
          type="hidden"
          id="user_zipcode"
          name="zipcode"
          value={zipcode}
          ref={userZipcodeRef}
        />

        <div className={styles.user_input}>
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
        <div className={styles.user_input}>
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
          <div className={styles.error_message}>{errorMessage.address}</div>
        )}

        <button type="submit" id="btnRegister">
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;
