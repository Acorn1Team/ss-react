import React from 'react';
import MonthlyRevenueChart from './AdminStatistics/MonthlyRevenue';
import BestSellerChart from './AdminStatistics/BestSeller';
import MonthlyBestSellerChart from './AdminStatistics/MonthlyBestSeller';
import ReturnRateChart from './AdminStatistics/ReturnRate';

export default function AdminHome() {
    return (
        <><br/>
        <ul id="statistics">
            <li><MonthlyRevenueChart /></li>
            <li><BestSellerChart /></li>
            <li><MonthlyBestSellerChart /></li>
            <li><ReturnRateChart /></li>
        </ul>
        </>
    );
}
