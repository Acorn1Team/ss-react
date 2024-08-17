import { Route, Routes } from "react-router-dom";
import AdminHome from "../AdminHome";
import FashionManage from "../AdminFashion/FashionManage"
import ProductManage from "../AdminProduct/ProductManage";
import HelpManage from "../AdminHelp/HelpManage";
import PromotionManage from "../AdminPromotion/PromotionManage";
import CommunityManage from "../AdminCommunity/CommunityManage";
import OrderManage from "../AdminOrder/OrderManage";
import NoticeManage from "../AdminHelp/NoticeManage";
import NoticeDetail from "../AdminHelp/NoticeDetail";

import NoticeForm from "../AdminHelp/NoticeForm";


import ProductInsert from "../AdminProduct/ProductInsert";
import ProductUpdateForm from "../AdminProduct/ProductUpdateForm";
import ProductDetail from "../AdminProduct/ProductDetail";

import PromotionCoupon  from "../AdminPromotion/PromotionCoupon";
import PromotionAdvertise  from "../AdminPromotion/PromotionAdvertise";
export default function AdminRoutes(){
    return(
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/fashion" element={<FashionManage />} />
          
          <Route path="/product" element={<ProductManage />} />
          <Route path="/product/insert" element={<ProductInsert />} />
          <Route path="/product/update/:no" element={<ProductUpdateForm />} />
          <Route path="/product/detail/:no" element={<ProductDetail />} /> {/* 추가 */}

          <Route path="/order" element={<OrderManage />} />

          <Route path="/help" element={<HelpManage />} />
            <Route path="/help/notices" element={<NoticeManage />} />
            <Route path="/help/notices/new" element={<NoticeForm />} />
            <Route path="/help/notices/:no" element={<NoticeDetail />} />
            
          
          <Route path="/community" element={<CommunityManage />} />
          
          <Route path="/promotion" element={<PromotionManage />} />
         
          <Route path="/promotion/coupon" element={<PromotionCoupon />} /> {/* 쿠폰 페이지 라우팅 */}
           <Route path="/admin/promotion/advertise" element={<PromotionAdvertise />} />

        </Routes>
    )    
}
