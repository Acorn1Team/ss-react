import React from 'react';
import MonthlyRevenueChart from "./AdminStatistics/AdminStatistics";

export default function AdminHome() {
    return (
        <div style={{ width: '60%', height: '200px', margin: 'auto' }}>
            <MonthlyRevenueChart />
        </div>
    );
}
