import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // 리액트 차트 필수 components

export default function MonthlyBestSellerChart() {
    const [bestSellerData, setBestSellerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get('/admin/statistics/products/monthly-best')
            .then((response) => {
                setBestSellerData(response.data);
            })
            .catch((err) => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // 데이터 가공
    const chartData = {
        labels: bestSellerData.map(d => `${d[0]}`), // 상품 이름
        datasets: [
            {
                label: '판매량',
                data: bestSellerData.map(d => d[1]), // 판매량
                backgroundColor: 'lightgray', // 막대 배경색
                borderColor: 'gray', // 막대 테두리 색
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        indexAxis: 'y', // 세로 방향 막대 그래프
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '판매량'
                }
            },
            y: {
                beginAtZero: true,
            }
        }
    };

    return (
        <div>
            <h3>이번 달의 베스트 셀러</h3>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};
