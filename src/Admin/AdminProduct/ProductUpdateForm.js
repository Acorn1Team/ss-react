import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductUpdateForm() {
    const { no } = useParams();
    const navigate = useNavigate();

    const [state, setState] = useState({
        name: "",
        price: "",
        contents: "",
        category: "",
        pic: null,
        stock: "",
        discountRate: "",
    });

    useEffect(() => {
        axios.get("/admin/product/" + no)
            .then(res => {
                setState(res.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [no]);

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        setState(prevState => ({
            ...prevState,
            pic: files[0] // 이미지 파일 객체를 pic 상태에 저장
        }));
    };

    const handleSave = () => {
        const formData = new FormData();

        // 상품 데이터를 JSON 문자열로 변환하여 FormData에 추가
        formData.append("productDto", JSON.stringify({
            ...state,
            pic: state.pic ? null : state.pic // pic 필드가 없거나 이미 경로라면 null로 설정
        }));

        // 선택된 이미지 파일이 있는 경우 FormData에 추가
        if (state.pic instanceof File) {
            formData.append("pic", state.pic);
        }

        axios.put("/admin/product/" + no, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then(res => {
            if (res.data.isSuccess) {
                navigate("/admin/product");
            } else {
                alert("수정에 실패했습니다: " + res.data.message);
            }
        })
        .catch(error => {
            console.log(error);
            alert("오류 발생: " + (error.response ? error.response.data : "알 수 없는 오류"));
        });
    };

    return (
        <>
            <h2>상품 정보 수정</h2>
            <div>
                <label>이름 :</label>
                <input type="text" name="name" value={state.name} onChange={handleChange} />
            </div>
            <div>
                <label>가격 :</label>
                <input type="text" name="price" value={state.price} onChange={handleChange} />
            </div>
            <div>
                <label>콘텐츠 :</label>
                <input type="text" name="contents" value={state.contents} onChange={handleChange} />
            </div>
            <div>
                <label>카테고리 :</label>
                <input type="text" name="category" value={state.category} onChange={handleChange} />
            </div>
            <div>
                <label>이미지 :</label>
                <input type="file" name="pic" onChange={handleFileChange} />
            </div>
            <div>
                <label>재고 :</label>
                <input type="text" name="stock" value={state.stock} onChange={handleChange} />
            </div>
            <div>
                <label>할인률 :</label>
                <input type="text" name="discountRate" value={state.discountRate} onChange={handleChange} />
            </div>

            <button onClick={handleSave}>수정 확인</button>
        </>
    );
}
