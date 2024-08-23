import { Route, Routes } from "react-router-dom";
import AdminHome from "../AdminHome";
import ShowManage from "../AdminFashion/ShowManage";
import ProductManage from "../AdminProduct/ProductManage";
import HelpManage from "../AdminHelp/HelpManage";
import PromotionManage from "../AdminPromotion/PromotionManage";
import CommunityManage from "../AdminCommunity/CommunityManage";
import OrderManage from "../AdminOrder/OrderManage";
import OrderDetail from "../AdminOrder/OrderDetail";
import NoticeManage from "../AdminHelp/NoticeManage";
import NoticeDetail from "../AdminHelp/NoticeDetail";
import NoticeForm from "../AdminHelp/NoticeForm";
import ProductInsert from "../AdminProduct/ProductInsert";
import ProductUpdateForm from "../AdminProduct/ProductUpdateForm";
import ProductDetail from "../AdminProduct/ProductDetail";

import PromotionCoupon from "../AdminPromotion/PromotionCoupon";
import PromotionAdvertise from "../AdminPromotion/PromotionAdvertise";
import ActorManage from "../AdminFashion/ActorManage";
import StyleManage from "../AdminFashion/StyleManage";

<<<<<<< Updated upstream
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/fashion" element={<ShowManage />} />
      <Route path="/fashion/show/:no" element={<ActorManage />} />
      {/*<Route path="/fashion/character/:no" element={<StyleManage />} /> */}
      <Route path="/product" element={<ProductManage />} />
      <Route path="/product/insert" element={<ProductInsert />} />
      <Route path="/product/update/:no" element={<ProductUpdateForm />} />
      <Route path="/product/detail/:no" element={<ProductDetail />} />
      <Route path="/orders" element={<OrderManage />} />
      <Route path="/orders/detail/:orderNo" element={<OrderDetail />} />
      <Route path="/help" element={<HelpManage />} />
      <Route path="/help/notices" element={<NoticeManage />} />
      <Route path="/help/notices/new" element={<NoticeForm />} />
      <Route path="/help/notices/:no" element={<NoticeDetail />} />
      <Route path="/community" element={<CommunityManage />} />
      <Route path="/promotion" element={<PromotionManage />} />
      <Route path="/promotion/coupon" element={<PromotionCoupon />} />{" "}
      {/* 쿠폰 페이지 라우팅 */}
      <Route path="promotion/advertise" element={<PromotionAdvertise />} />
    </Routes>
  );
=======
export default function AdminRoutes(){
    return(
        <Routes>

          <Route path="/" element={<AdminHome />} />
          <Route path="/fashion" element={<ShowManage />} />
            <Route path="/fashion/show/:no" element={<ActorManage />} />
            <Route path="/fashion/character/:no" element={<StyleManage />} />
          
          <Route path="/product" element={<ProductManage />} />
            <Route path="/product/insert" element={<ProductInsert />} />
            <Route path="/product/update/:no" element={<ProductUpdateForm />} />
            <Route path="/product/detail/:no" element={<ProductDetail />} />

          <Route path="/orders" element={<OrderManage />} />
            <Route path="/orders/detail/:orderNo" element={<OrderDetail />} /> 
          
          <Route path="/help" element={<HelpManage />} />
            <Route path="/help/notices" element={<NoticeManage />} />
              <Route path="/help/notices/new" element={<NoticeForm />} />
              <Route path="/help/notices/:no" element={<NoticeDetail />} />
            
          <Route path="/community" element={<CommunityManage />} />
          
          <Route path="/promotion" element={<PromotionManage />} />
            <Route path="/promotion/coupon" element={<PromotionCoupon />} /> {/* 쿠폰 페이지 라우팅 */}
            <Route path="promotion/advertise" element={<PromotionAdvertise />} />

        </Routes>
    )    
>>>>>>> Stashed changes
}
