import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BestSellerDetail() {
    const [bestSellerData, setBestSellerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Replace useHistory with useNavigate

    useEffect(() => {
        axios
            .get('/admin/statistics/products/best')
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
                backgroundColor: '#ffe082',
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
            <h2>인기 상품</h2>
            <table>
                <thead>
                    <tr><td>상품코드</td><td>상품명</td><td>수량</td></tr>
                </thead>
                <tbody>
                {bestSellerData.map((data) => (
                    <tr>
                        <td>{data.no}</td>
                        <td>{data.name}</td>
                        <td>{data.quantity}개</td>
                    </tr>
                ))}
                </tbody><br/>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', 
                            width: '100%', height: '100%' }}>
                <div style={{ width: '600px', height: '400px' }}>
            <Bar data={chartData} options={chartOptions} /><br/><br/><br/>
            <strong style={{ cursor:"pointer"}} onClick={() => navigate('/admin')}>돌아가기</strong>
            </div></div>
        </div>
    );
}
