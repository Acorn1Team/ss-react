import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Cartlist(){
    const { no } = useParams();

    return(
        <>
        장바구니 페이지입니다.
        </>
    );
}