import { Route, Routes } from "react-router-dom";
import AdminHome from "../AdminHome";
import ShowSearch from "../AdminFashion/ShowSearch";
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
import PromotionCoupon from "../AdminPromotion/PromotionCoupon";
import PromotionAdvertise from "../AdminPromotion/PromotionAdvertise";
import ActorEdit from "../AdminFashion/ActorEdit";
import StyleManage from "../AdminFashion/StyleManage";
import AdminChat from "../AdminHelp/AdminChat";
import PromotionPopup from "../AdminPromotion/PromotionPopup";
import MonthlyRevenueDetail from "../AdminStatistics/MonthlyRevenueDetail";
import MonthlyBestSellerDetail from "../AdminStatistics/MonthlyBestSellerDetail";
import BestSellerDetail from "../AdminStatistics/BestSellerDetail";
import ReturnRateDetail from "../AdminStatistics/ReturnRateDetail";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />

      <Route path="/fashion" element={<ShowSearch />} />
        <Route path="/fashion/show/:no" element={<ActorEdit />} />
        <Route path="/fashion/show/:no" element={<ActorEdit />} />
        <Route path="/fashion/character/:no" element={<StyleManage />} />

      <Route path="/product" element={<ProductManage />} />
        <Route path="/product/insert" element={<ProductInsert />} />
        <Route path="/product/update/:no" element={<ProductUpdateForm />} />

      <Route path="/orders" element={<OrderManage />} />

      <Route path="/help" element={<HelpManage />} />
        <Route path="/help/notices" element={<NoticeManage />} />
        <Route path="/help/notices/new" element={<NoticeForm />} />
        <Route path="/help/notices/:no" element={<NoticeDetail />} />
        <Route path="/help/chat" element={<AdminChat />} />

      <Route path="/community" element={<CommunityManage />} />

      <Route path="/promotion" element={<PromotionManage />} />
        <Route path="/promotion/coupon" element={<PromotionCoupon />} />
        <Route path="/promotion/advertise" element={<PromotionAdvertise />} />
        <Route path="/promotion/popup" element={<PromotionPopup />} />

      <Route path="/statistics/monthly-revenue" element={<MonthlyRevenueDetail />} />
      <Route path="/statistics/bestseller" element={<BestSellerDetail />} />
      <Route path="/statistics/monthly-bestseller" element={<MonthlyBestSellerDetail />} />
      <Route path="/statistics/return" element={<ReturnRateDetail />} />
    </Routes>
  );
}
