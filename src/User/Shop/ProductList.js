import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";


export default function ProductList(){
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState("latest");

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



 // 정렬 옵션 
 const sortProducts = (products, option) => {
    switch (option) {
        case "latest":
            return products.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
        case "sales":
            return products.sort((a, b) => b.count - a.count); // 판매순
        case "priceHigh":
            return products.sort((a, b) => b.price - a.price); // 가격 높은 순
        case "priceLow":
            return products.sort((a, b) => a.price - b.price); // 가격 낮은 순
        default:
            return products;
    }
};

    const sortedProducts = sortProducts([...products], sortOption); // 정렬된 리스트

    return(
        <>
        <div>
        <label id="sortOptions">정렬 기준: </label>
        <select
            id="sortOptions"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
        >
            <option value="latest">최신순</option>
            <option value="sales">판매순</option>
            <option value="priceHigh">가격 높은 순</option>
            <option value="priceLow">가격 낮은 순</option>
        </select>
    </div>

        <Link to="/user/shop/productlist/category/Category1">상의</Link>
        <Link to="/user/shop/productlist/category/Category2">하의</Link>
        <Link to="/user/shop/productlist/category/Category3">신발</Link>
        <Link to="/user/shop/productlist/category/Category4">기타</Link>
      
        {sortedProducts.map((product) => ( 
            <div key={product.num}>
            <div>{product.no}</div>
            <div>{product.name}</div>
            <div>{product.price}</div>
            <div>{product.date}</div>
            <div>{product.category}</div>
            {/* <div>{product.pic}</div> */}
            <div>
            <Link to={`/user/shop/productlist/detail/${product.no}`}><img src={product.pic} alt="{product.name} 사진"/></Link>
            </div>
            <div>{product.discountRate}</div>
            <div>{product.score}</div>

            
            </div>
        ))}
        </>
    )
}