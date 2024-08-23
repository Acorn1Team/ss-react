import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductInsert() {
    const navigate = useNavigate();
    const [state, setState] = useState({
        name: "",
        price: 0,
        contents: "",
        category: "",
        pic: null,
        stock: 0,
        score: 0,
        discountRate: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 숫자 필드인 경우 값을 숫자로 변환
        const parsedValue = ["price", "stock", "discountRate", "score"].includes(name) ? parseInt(value) || 0 : value;

        setState(prevState => ({
            ...prevState,
            [name]: parsedValue
        }));
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        setState(prevState => ({
            ...prevState,
            pic: files[0] // 파일 객체를 pic 상태에 저장
        }));
    };

    const handleSave = () => {
        const formData = new FormData();

        // 오늘 날짜를 생성하여 productDto에 추가
        const today = new Date().toISOString(); // ISO 형식으로 변환
        const { pic, ...otherData } = state;
        formData.append("productDto", JSON.stringify({ ...otherData, date: today }));

        // 파일이 있는 경우 추가
        if (pic) {
            formData.append("pic", pic);
        }

        axios.post("/admin/product", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then(res => {
            if (res.data.isSuccess) {
                alert("상품이 성공적으로 추가되었습니다.");
                navigate("/admin/product");
            } else {
                alert("상품 추가에 실패했습니다: " + res.data.message);
            }
        })
        .catch(error => {
            if (error.response) {
                alert("오류 발생: " + error.response.data);
            } else {
                console.log(error);
            }
        });
    };

    return (
        <>
            <h2>*상품 추가*</h2>
            <div>
                <label>이름 :</label>
                <input onChange={handleChange} type="text" name="name" placeholder="상품 입력" />
            </div>
            <br />
            <div>
                <label>가격 :</label>
                <input onChange={handleChange} type="text" name="price" placeholder="가격 입력" />
            </div>
            <br />
            <div>
                <label>상품 설명 :</label>
                <input onChange={handleChange} type="text" name="contents" placeholder="상품 설명 입력" />
            </div>
            <br />
            <div>
                <label>카테고리 :</label>
                <select onChange={handleChange} name="category">
                    <option value="">선택해주세요</option>
                    <option value="상의">상의</option>
                    <option value="하의">하의</option>
                    <option value="신발">신발</option>
                    <option value="기타">기타</option>
                </select>
            </div>
            <br />
            <div>
                <label>이미지 :</label>
                <input onChange={handleFileChange} type="file" name="pic" placeholder="이미지 입력" />
            </div>
            <br />
            <div>
                <label>재고 :</label>
                <input onChange={handleChange} type="text" name="stock" placeholder="재고 입력" />
            </div>
            <br />
            <div>
                <label>할인율 :</label>
                <input onChange={handleChange} type="text" name="discountRate" placeholder="할인율 입력" />
            </div>
            <br />
            <button onClick={handleSave}>추가</button>
        </>
    );
}
