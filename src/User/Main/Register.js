import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Style/UserRegister.module.css";
import axios from "axios";
import Modal from "react-modal";
import Loading from "../User/Loading";
import "../Style/All.css";

const Register = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwdChk, setPwdChk] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [tel, setTel] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [addrStart, setAddrStart] = useState("");
  const [addrEnd, setAddrEnd] = useState("");
  const [showAddrEnd, setShowAddrEnd] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [errorMessage, setErrorMessage] = useState({});
  const [emailOptions, setEmailOptions] = useState([
    { value: "0", text: "선택하세요" },
    { value: "9", text: "직접입력" },
    { value: "naver.com", text: "naver.com" },
    { value: "gmail.com", text: "gmail.com" },
    { value: "hanmail.net", text: "hanmail.net" },
    { value: "nate.com", text: "nate.com" },
    { value: "kakao.com", text: "kakao.com" },
  ]);

  const [customDomainInput, setCustomDomainInput] = useState("");
  const [result, setResult] = useState(null); // 이메일 체크를 위한 변수
  const fullEmail = `${email}@${emailDomain}`;
  const [idChecked, setIdChecked] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  // 정규 표현식
  const userPwdRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,}$/; // 최소 4자, 영문, 숫자, 특수문자 포함
  const userIdRegex = /^[a-zA-Z0-9]{4,20}$/; // 4~20자의 영문, 숫자만 허용
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // 이메일 형식 검증 정규 표현식
  const nv = useNavigate();

  // Modal과 Loading
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [loading, setLoading] = useState(false);

  const updateErrorMessage = (field, message) => {
    setErrorMessage((prevState) => ({
      ...prevState,
      [field]: message,
    }));
  };

  const openModal = (type, content) => {
    setModalType(type);
    setModalContent(content);
    setModalIsOpen(true);
  };

  // 통합 회원가입 모달 띄우기 함수
  const showIntegratedSignupModal = () => {
    openModal(
      "integrated",
      "소셜 계정으로 가입된 메일입니다. 통합으로 가입을 진행하시겠습니까?"
    );
  };

  const showCodeModal = () => {
    openModal("code", "인증번호가 이메일로 전송되었습니다.");
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const loginModal = () => {
    setModalIsOpen(false);
    navigate("/user/auth/login");
  };

  const updateModal = async () => {
    setModalIsOpen(false);

    try {
      const response = await axios.get(
        "/user/emailCheck",
        { params: { email: fullEmail } } // 이메일을 파라미터로 전달
      ); // API 엔드포인트와 이메일 파라미터를 적절히 설정하세요
      const userInfo = response.data;

      // 상태 업데이트
      setName(userInfo.name || "");
      setTel(userInfo.tel || "");
      setZipcode(userInfo.zipcode || "");
      setAddrStart(userInfo.addrStart || "");
      setShowAddrEnd(false);
      setShowEmail(false);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

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
        `/user/auth/check?id=${encodeURIComponent(id)}`,
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

  // 이메일 중복 확인 함수
  const checkEmailDuplication = async (email, setErrorMessage) => {
    try {
      const response = await axios.get("/user/emailCheck", {
        params: { email }, // 파라미터로 이메일 전달
      });
      const data = response.data;

      if (data.exists) {
        if (data.id_n || data.id_k || data.id_g) {
          // 통합 회원가입 모달 띄우기
          showIntegratedSignupModal();
        } else {
          updateErrorMessage("email", "이미 등록된 이메일입니다.");
          return false;
        }
      } else {
        // 이메일이 없는 경우
        await sendEmailVerificationCode(
          email,
          setVerificationCode,
          setErrorMessage
        );
      }

      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("이메일 확인 중 오류가 발생했습니다.");
    }
  };

  // 이메일 인증 번호 요청 함수
  const sendEmailVerificationCode = async (
    email,
    setVerificationCode,
    setErrorMessage
  ) => {
    setLoading(true);
    console.log(email, setVerificationCode, setErrorMessage);
    try {
      const response = await fetch(
        "/user/auth/send-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const result = await response.json();
      console.log("Verification Code Response:", result); // 응답 확인
      <Loading />;

      if (response.ok) {
        setVerificationCode(result.code); // 서버에서 반환한 인증번호
        // setModalContent("인증번호가 이메일로 전송되었습니다.");
        showCodeModal();

        // alert("인증번호가 이메일로 발송되었습니다.");
      } else {
        setErrorMessage(result.message); // 서버에서 반환한 에러 메시지
      }
    } catch (error) {
      console.error("인증번호 발송 중 오류 발생:", error);
      setErrorMessage("인증번호 발송 실패");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };
  const verifyEmailCodeOnServer = async (email, inputCode, setErrorMessage) => {
    try {
      const response = await fetch(
        "/user/auth/verify-code",
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
    if (!zipcode || !addrStart)
      errors.address = "우편번호와 기본 주소는 필수 항목입니다.";

    return errors;
  };

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
        setShowAddrEnd(true); // 상세 주소 입력 필드 표시
        if (addrEndRef.current) addrEndRef.current.focus();
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

    // 이메일 인증 체크
    if (showEmail) {
      // setLoading(true); // 로딩 시작
      const isVerified = await verifyEmailCodeOnServer(
        `${email}@${emailDomain}`,
        inputVerificationCode,
        setErrorMessage
      );

      // 콘솔에 인증 상태 확인
      console.log("Email Verified:", isVerified);

      if (!isVerified) {
        setErrorMessage((prev) => ({
          ...prev,
          email: "이메일 인증이 완료되지 않았습니다.",
        }));
        // setLoading(false); // 로딩 종료
        return;
      }
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

    setLoading(true);
    try {
      const response = await fetch("/user/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`회원가입 요청이 실패했습니다: ${errorText}`);
      }
      <Loading />;
      await response.json();
      navigate("/user/register/success");
    } catch (error) {
      console.error("회원가입 요청 중 오류 발생:", error);
      setErrorMessage({ global: error.message });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        {loading && <Loading />} {/* 로딩 컴포넌트 표시 */}
        <form className="register_Form" onSubmit={handleRegister}>
          <h1>회원가입</h1>
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
            <span>@</span>
            <input
              type="text"
              name="email_domain"
              id="email_domain"
              value={isCustomDomain ? customDomainInput : emailDomain}
              onChange={handleCustomDomainInputChange}
              disabled={!isCustomDomain}
            />
            {showEmail && (
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
            )}
          </div>

          {showEmail && (
            <>
              {/* {errorMessage.email && (
                <div className={styles.error_message}>{errorMessage.email}</div>
              )} */}
              <input
                className="btn1Long"
                value="인증번호 전송"
                type="button"
                onClick={async () => {
                  if (!email || !emailDomain) {
                    setErrorMessage((prev) => ({
                      ...prev,
                      email: "이메일을 입력하세요.",
                    }));
                    return;
                  }

                  // 이메일 중복 체크 및 인증번호 발송
                  await checkEmailDuplication(
                    fullEmail,
                    setVerificationCode,
                    setErrorMessage
                  );
                }}
                disabled={!email || !emailDomain}
              ></input>
              <div className={styles.user_input}>
                <label>
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
            </>
          )}

          {errorMessage.email && (
            <div className={styles.error_message}>{errorMessage.email}</div>
          )}
          <hr />
          {/* 아이디 */}
          <div className={styles.id_input}>
            <input
              type="text"
              name="id"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <input
              className="btn1"
              id="idCheck"
              value="중복 확인"
              type="button"
              onClick={() => idCheck(id, setErrorMessage, setIdChecked)}
            >
              {/* 중복 확인 */}
            </input>
          </div>
          {errorMessage.id && (
            <div className={styles.error_message}>{errorMessage.id}</div>
          )}

          {/* 비밀번호 */}
          <div className={styles.pwd_input}>
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
          <div className={styles.pwd_input}>
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
          <div className={styles.zipcode_input}>
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
            <input
              type="button"
              value="검색"
              className="btn1"
              onClick={openDaumPostcode}
            ></input>
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
            {showAddrEnd && (
              <input
                type="text"
                ref={addrEndRef}
                name="addr_end"
                placeholder="상세 주소"
                onChange={(e) => setAddrEnd(e.target.value)}
                value={addrEnd}
                style={{ marginTop: "5px" }}
              />
            )}
          </div>
          {errorMessage.address && (
            <div className={styles.error_message}>{errorMessage.address}</div>
          )}

          <input
            type="button"
            value="회원가입"
            className="btn2"
            id="btnRegister"
            onClick={handleRegister}
          ></input>
        </form>
        <Modal
          isOpen={modalIsOpen}
          className={styles.modal}
          onRequestClose={closeModal}
          overlayClassName={styles.overlay}
        >
          <h2>알림</h2>
          <p>{modalContent}</p>
          {modalType === "integrated" && (
            <>
              <input
                type="button"
                value="확인"
                onClick={updateModal}
                className="btn2"
              ></input>
              <input
                type="button"
                onClick={loginModal}
                className="btn3"
                value="로그인"
              ></input>
            </>
          )}
          {modalType === "code" && (
            <button onClick={closeModal} className="btn2">
              확인
            </button>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Register;
