import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const SalesSummary = () => {
    const navigate = useNavigate();
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalesSummary = async () => {
            try {
                const response = await api.get('/reports/sales-summary');
                setSalesData(response.data);
            } catch (error) {
                console.error("Error fetching sales summary:", error);
                alert("Error fetching sales summary. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSalesSummary();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Sales Summary</h1>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back to Dashboard
                </button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : salesData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">Today's Sales</h2>
                        <p className="text-3xl font-bold">KES {salesData.today}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">This Week's Sales</h2>
                        <p className="text-3xl font-bold">KES {salesData.week}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">This Month's Sales</h2>
                        <p className="text-3xl font-bold">KES {salesData.month}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">This Year's Sales</h2>
                        <p className="text-3xl font-bold">KES {salesData.year}</p>
                    </div>
                </div>
            ) : (
                <p>No sales data available.</p>
            )}
        </div>
    );
};

export default SalesSummary;