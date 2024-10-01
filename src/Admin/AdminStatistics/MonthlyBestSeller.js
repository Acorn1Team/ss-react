import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlyBestSellerChart() {
    const [bestSellerData, setBestSellerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Replace useHistory with useNavigate

    useEffect(() => {
        axios
            .get('/api/admin/statistics/products/monthly-best')
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

    const chartData = {
        labels: bestSellerData.map(d => d.name),
        datasets: [
            {
                label: '판매량',
                data: bestSellerData.map(d => d.quantity),
                backgroundColor: '#90caf9',
                borderColor: 'gray',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        indexAxis: 'y',
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
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const productNo = bestSellerData[index].no;
                navigate(`/admin/product/detail/${productNo}`); // Use navigate instead of history.push
            }
        }
    };

    return (
        <div id='admin-body'>
            <h2>이번 달의 인기 상품</h2>
            <Bar data={chartData} options={chartOptions} />
            <strong style={{ cursor:"pointer"}} onClick={() => navigate('/admin/statistics/monthly-bestseller')}>자세히</strong>
        </div>
    );
}
