import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Style/PromotionCoupon.module.css";
import Modal from "react-modal";

export default function PromotionCoupon() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    name: "",
    discountRate: "",
    expiryDate: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [discountRateError, setDiscountRateError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "discountRate") {
      if (value < 0) {
        setDiscountRateError("할인율은 0 이상이어야 합니다.");
        return;
      } else if (value >= 100) {
        setDiscountRateError("할인율은 100 미만이어야 합니다.");
        return;
      } else {
        setDiscountRateError(""); // 에러 없을 시 초기화
      }
    }

    setState({
      ...state,
      [name]: value,
    });
  };

  const addCoupon = () => {
    const { name, discountRate } = state;

    if (!discountRate) {
      setDiscountRateError("할인율을 입력해 주세요.");
      return;
    }

    const expiryDate = state.expiryDate || getFutureDate(7);

    const couponData = {
      ...state,
      expiryDate,
    };

    axios
      .post("/admin/coupon", couponData)
      .then((response) => {
        if (response.data.isSuccess) {
          setIsModalOpen(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getFutureDate = (days) => {
    const today = new Date();
    today.setDate(today.getDate() + days);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className={styles.container}>
      <h2>쿠폰 등록</h2>
      <div className={styles.formGroup}>
        <label>쿠폰 이름</label>
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label>할인율</label>
        <div className={styles.inline}>
          <input
            type="number"
            name="discountRate"
            value={state.discountRate}
            onChange={handleChange}
            className={styles.input}
          />
          <span>%</span>
        </div>
        {discountRateError && (
          <p className={styles.errorMessage} style={{color:"red"}}>{discountRateError}</p>
        )}
      </div>
      <div className={styles.formGroup}>
        <label>유효기간</label>
        <input
          type="date"
          name="expiryDate"
          value={state.expiryDate}
          onChange={handleChange}
          className={styles.input}
        />
      </div>
      <button onClick={addCoupon} className={styles.button}>
        등록
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="쿠폰 등록 완료 확인"
        style={{overlay: {backgroundColor: "rgba(0, 0, 0, 0.5)",},
                content: {
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                maxWidth: "300px",
                height: "180px",
                margin: "auto",
                },
        }}>
          <><br/>
              <h3>쿠폰 발급이 완료되었습니다!</h3>
              <button onClick={() => navigate("/admin/promotion")}>목록으로 돌아가기</button>
          </>
        </Modal>
    </div>
  );
}
