import React from 'react';
import MonthlyRevenueChart from './AdminStatistics/MonthlyRevenue';
import BestSellerChart from './AdminStatistics/BestSeller';
import MonthlyBestSellerChart from './AdminStatistics/MonthlyBestSeller';

export default function AdminHome() {
    return (
        <ul id="statistics">
            <li><BestSellerChart /></li>
            <li><MonthlyBestSellerChart /></li>
            <li><MonthlyRevenueChart /></li>
        </ul>
    );
}
