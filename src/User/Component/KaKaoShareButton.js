import React, { useEffect } from "react";

const KakaoShareButton = ({ title, description, imageUrl, webUrl }) => {
  useEffect(() => {
    // Kakao SDK 로드
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.integrity =
      "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      // SDK가 로드된 후에만 초기화 시도
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init("8ebaddf174fbce6337a92c63c1c42bf2"); // 사용하려는 앱의 JavaScript 키 입력

        // 버튼 생성
        window.Kakao.Share.createDefaultButton({
          container: "#kakaotalk-sharing-btn",
          objectType: "feed",
          content: {
            title: title,
            description: description,
            imageUrl: "https://i.ibb.co/s9r1cty/ready.png",
            link: {
              webUrl: "http://192.168.0.12:3000/user",
            },
          },
          buttons: [
            {
              title: "SCENESTEALER",
              link: {
                webUrl: webUrl,
              },
            },
          ],
        });
      }
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const script = document.querySelector(
        'script[src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"]'
      );
      if (script) {
        script.remove();
      }
    };
  }, [title, description, imageUrl, webUrl]);

  return (
    <a id="kakaotalk-sharing-btn" href="#">
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
        alt="카카오톡 공유 보내기 버튼"
        height={"30px"}
      />
    </a>
  );
};

export default KakaoShareButton;
