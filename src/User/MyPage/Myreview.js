import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"; 
import axios from "axios";

function Myreview(){
    const { userNo } = useParams(); //userNo
    const [product, setProduct] = useState([]); // 구매 제품 리스트

    //   // 리뷰 데이터 가져오기
    const myreviews = () => {
        axios
        .get(`/mypage/review/${userNo}`)
        .then((res) => {
            setProduct(res.data.product); //userid당 주문 제목 이랑 리뷰
        })
        .catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        myreviews(); 
    }, );


    return(
        <>
          {product.map((mybuyProducts) => (
            <div key={mybuyProducts.no}>
                <div>리뷰 번호: {mybuyProducts.no}</div>
                <div>사용자: {mybuyProducts.userNickname}</div>
                <div>제품: {mybuyProducts.productName}</div>
                <div>사진: {mybuyProducts.pic}</div>
            </div>
        ))}
        </>

    );
}

export default Myreview;