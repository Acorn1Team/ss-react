import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend); // 리액트 차트 필수 components

export default function MonthlyRevenueChart(){
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
        .get('/admin/statistics/orders/monthly-revenue', {params: {startDate: '2024-01-01T00:00:00', endDate: '2024-12-31T23:59:59'}})
        .then((response) => {setMonthlyData(response.data);})
        .catch((err) => {setError(err);})
        .finally(() => {setLoading(false);})
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const chartData = {
        labels: monthlyData.map(d => `${d.month}월`),
        datasets: [{label: '월별 매출', data: monthlyData.map(d => d.totalRevenue), fill: false, borderColor: 'gray', tension: 0.1},]
    };

    return (
        <div>
            <h3>2024년 월별 매출</h3>
            <Line data={chartData} options={{ responsive: true }} />
        </div>
    );
};