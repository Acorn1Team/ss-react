import { Route, Routes } from "react-router-dom";
import AdminHome from "../AdminHome";
import FashionManage from "../AdminFashion/FashionManage"
import ProductManage from "../AdminProduct/ProductManage";
import HelpManage from "../AdminHelp/HelpManage";
import PromotionManage from "../AdminPromotion/PromotionManage";
import CommunityManage from "../AdminCommunity/CommunityManage";
import OrderManage from "../AdminOrder/OrderManage";
import NoticeManage from "../AdminHelp/NoticeManage";

export default function AdminRoutes(){
    return(
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/fashion" element={<FashionManage />} />
          
          <Route path="/product" element={<ProductManage />} />
          
          <Route path="/order" element={<OrderManage />} />
          
          <Route path="/help" element={<HelpManage />} />
            <Route path="/help/notices" element={<NoticeManage />} />
            
          
          <Route path="/community" element={<CommunityManage />} />
          
          <Route path="/promotion" element={<PromotionManage />} />
        </Routes>
    )    
}
