import React, { useEffect } from "react";

export default function TranslateWidget() {
  useEffect(() => {
    // 스크립트가 이미 로드되었는지 확인
    if (!window.gtranslateSettings) {
      // GTranslate 설정
      const script1 = document.createElement('script');
      script1.innerHTML = `
        window.gtranslateSettings = {
          "default_language": "ko",
          "detect_browser_language": true,
          "languages": ["ko", "en", "ja", "zh-CN", "es", "de"],
          "wrapper_selector": ".gtranslate_wrapper",
          "flag_size": 20,
        };
      `;
      document.body.appendChild(script1);

      // GTranslate 스크립트 추가
      const script2 = document.createElement('script');
      script2.src = "https://cdn.gtranslate.net/widgets/latest/flags.js";
      script2.defer = true;
      document.body.appendChild(script2);

      // cleanup을 추가해 메모리 누수를 방지
      return () => {
        document.body.removeChild(script1);
        document.body.removeChild(script2);
      };
    }
  }, []);

  return <div className="gtranslate_wrapper" />;
}
