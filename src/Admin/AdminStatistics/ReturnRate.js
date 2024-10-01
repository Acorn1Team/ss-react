import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // Chart.js 필수 components

export default function ReturnRateChart() {
    const [returnRateData, setReturnRateData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/admin/statistics/products/return-rate')
            .then((response) => { setReturnRateData(response.data); })
            .catch((err) => { setError(err); })
            .finally(() => { setLoading(false); });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const chartData = {
        labels: returnRateData.map(d => d.productName),
        datasets: [
            {
                label: '반품율',
                data: returnRateData.map(d => d.returnRate),
                backgroundColor: '#ffab91',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                // 추가 데이터
                additionalData: returnRateData.map(d => ({
                    canceledQuantity: d.canceledQuantity,
                    totalQuantity: d.deliveredQuantity + d.canceledQuantity
                }))
            },
        ],
    };

    const handleClick = (event, elements) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            const productNo = returnRateData[index].productNo;
            navigate(`/admin/product/detail/${productNo}`);
        }
    };

    return (
        <div id='admin-body'>
            <h2>불만족 상품</h2>
            <Bar
                data={chartData}
                options={{ 
                    responsive: true,
                    indexAxis: 'y', // 세로 바 그래프 설정
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const index = context.dataIndex;
                                    const dataset = context.dataset;
                                    const additionalData = dataset.additionalData[index];
                                    return [
                                        `${context.label}: ${context.raw}%`,
                                        `반품수량: ${additionalData.canceledQuantity}`,
                                        `총수량: ${additionalData.totalQuantity}`
                                    ];
                                }
                            }
                        }
                    },
                    onClick: handleClick
                }}
            />
            <strong style={{ cursor:"pointer"}} onClick={() => navigate('/admin/statistics/return')}>자세히</strong>
        </div>
    );
}
