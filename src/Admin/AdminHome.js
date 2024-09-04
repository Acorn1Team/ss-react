import React from 'react';
import MonthlyRevenueChart from './AdminStatistics/MonthlyRevenue';
import BestSellerChart from './AdminStatistics/BestSeller';
import MonthlyBestSellerChart from './AdminStatistics/MonthlyBestSeller';
import ReturnRateChart from './AdminStatistics/ReturnRate';

export default function AdminHome() {
    return (
        <>
        <ul id="statistics">
            <li><BestSellerChart /></li>
            <li><MonthlyBestSellerChart /></li>
            <li><ReturnRateChart /></li>
            <li><MonthlyRevenueChart /></li>
        </ul>
        </>
    );
}
