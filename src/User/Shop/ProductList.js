import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";


export default function ProductList(){
    const [products, setProducts] = useState([]);
    
    // const navigate = useNavigate();

    // // 카데고리 버튼 클릭시
    // const handleClick = (category) => {
    //     // 클릭 시 부모 컴포넌트에 새로운 카테고리 전달
    //     onCategoryChange(category);
    //     // ProductByCate로 이동
    //     navigate('/');
    // };

    const refresh = () => {
        // ajax 요청 (get 방식)
        axios
        .get("/list")
        .then((res) => {
            setProducts(res.data);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    useEffect(() => {
        refresh(); //ajax 요청 처리가 됨
    },[]);

 
    return(
        <>
        <Link to="/">상품메인화면</Link>
        {/* <Link to="/user/shop/productlist/top">상의</Link> */}
        {/* <button onClick={() => handleClick('상의')}>상의</button>
        <button onClick={() => handleClick('하의')}>하의</button>
        <button onClick={() => handleClick('신발')}>신발</button>
        <button onClick={() => handleClick('기타')}>기타</button> */}

        {products.map((product) => (
            <div key={product.num}>
            <div>{product.no}</div>
            <div>{product.name}</div>
            <div>{product.price}</div>
            <div>{product.date}</div>
            <div>{product.category}</div>
            <div>{product.pic}</div>
            <div>{product.discountRate}</div>
            <div>{product.score}</div>
            <div>{product.reviews}</div>
            </div>
        ))}
        </>
    )
}