import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import ProductList from './ProductList';

function ProductByCate() {
    const [category, setCategory] = useState('');
    const [products, setProducts] = useState([]);

    const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4']; // 상의, 하의, 신발, 기타로 생각함

    const refresh = (category) => {
        // ajax 요청 (get 방식)
        axios
        .get("/list/{category}")
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
           <div>
                {categories.map(product => (
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
            </div>
            <ProductList products={products} />
        </>
    )
}

export default ProductByCate;
