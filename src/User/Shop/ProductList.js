import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";

export default function ProductList(){
    const [products, setProducts] = useState([]);

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