import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function PracticeHaHaHA() {
  const [mainPopup, setMainPopup] = useState([]);
  const userNo = sessionStorage.getItem("id");

  useEffect(() => {
    axios
      .get(`/main/popup`)
      .then((res) => {
        const popupData = res.data.map((p) => ({
          ...p,
          popupOpen: getCookie(`${userNo}_popup_${p.no}`) === null,
        }));
        setMainPopup(popupData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userNo]);

  function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const closePopup = (day, popupNo) => {
    if (day) {
      document.cookie = `${userNo}_popup_${popupNo}=true; path=/; max-age=${60 * 60 * 24}`;
      // 하루(24시간) 동안 유효한 쿠키 설정
    }
    setMainPopup((prev) =>
      prev.map((p) =>
        p.no === popupNo ? { ...p, popupOpen: false } : p
      )
    );
  };

  return (
    <>
    <h2>하하</h2>
    <div>
      {mainPopup.map(
        (p) =>
          p.popupOpen && (
            <div key={p.no} className="popup-modal">
              <div className="popup-content">
                <Link to={p.path}>
                  <img src={p.pic} alt={p.no} width={"500px"} />
                </Link>
                <br />
                <button
                  className="popup-close"
                  onClick={() => closePopup(true, p.no)}
                >
                  오늘 하루 보지 않기
                </button>
                <button
                  className="popup-close"
                  onClick={() => closePopup(false, p.no)}
                >
                  닫기
                </button>
              </div>
            </div>
          )
      )}
    </div>
    </>
  );
}
