import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductDetail() {
    const { no } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        name: "",
        price: 0,
        contents: "",
        category: "",
        pic: "",
        stock: 0,
        score: 0,
        discountRate: 0,
    });

    useEffect(() => {
        axios.get(`/admin/product/${no}`)
            .then(res => {
                setProduct(res.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [no]);

    const handleUpdate = () => {
        navigate(`/admin/product/update/${no}`);
    };

    return (
        <>
            <h2>상품 상세 정보</h2>
            <div>
                <label>이름: </label>
                <span>{product.name}</span>
            </div>
            <div>
                <label>가격: </label>
                <span>{product.price}</span>
            </div>
            <div>
                <label>상품 설명: </label>
                <span>{product.contents}</span>
            </div>
            <div>
                <label>카테고리: </label>
                <span>{product.category}</span>
            </div>
            <div>
                <label>이미지: </label>
                <img src={product.pic} alt={product.name} style={{ width: '200px' }} />
            </div>
            <div>
                <label>재고: </label>
                <span>{product.stock}</span>
            </div>
            <div>
                <label>평점: </label>
                <span>{product.score}</span>
            </div>
            <div>
                <label>할인율: </label>
                <span>{product.discountRate}</span>
            </div>
            <br />
            <button onClick={handleUpdate}>수정하기</button>
        </>
    );
}
