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
        <Link to="/user/shop/productlist/category/Category 1">상의</Link>
        <Link to="/user/shop/productlist/category/Category 2">하의</Link>
        <Link to="/user/shop/productlist/category/Category 3">신발</Link>
        <Link to="/user/shop/productlist/category/Category 4">기타</Link>
      

        {products.map((product) => ( 
            <div key={product.num}>
            <div>{product.no}</div>
            <div>{product.name}</div>
            <div>{product.price}</div>
            <div>{product.date}</div>
            <div>{product.category}</div>
            {/* <div>{product.pic}</div> */}
            <div>
            <Link to={`/user/shop/productlist/detail/${product.no}`}>{product.pic}</Link>
            </div>
            <div>{product.discountRate}</div>
            <div>{product.score}</div>

            
            </div>
        ))}
        </>
    )
}