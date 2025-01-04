import React, { useEffect } from "react";
import ApexCharts from "apexcharts";
import InfoIcon from '../../assets/info-icon.svg?react';
import { Tooltip } from "flowbite-react";

export default function PieChart({ balances, categories, currency }) {
    useEffect(() => {
        const getChartOptions = () => ({
            series: Object.values(balances),
            colors: Object.keys(balances).map((key) => {
                const category = categories.find((cat) => cat.id === Number(key));
                return category ? category.color : "#000000";
            }),
            chart: {
                // height: 420,
                // width: 480,
                height: 300,
                width: 380,
                type: "pie",
                id: "pie-chart-instance",
            },
            stroke: {
                colors: ["white"],
            },
            plotOptions: {
                pie: {
                    labels: {
                        show: true,
                    },
                    size: "100%",
                    dataLabels: {
                        offset: -25
                    }
                },
            },
            labels: Object.keys(balances).map((key) => {
                const category = categories.find((cat) => cat.id === Number(key));
                return category ? category.name : key;
            }),
            dataLabels: {
                enabled: true,
                style: {
                    fontFamily: "Inter, sans-serif",
                },
            },
            legend: {
                position: "right",
                fontFamily: "Inter, sans-serif",
            },
            tooltip: {
                enabled: true,
                y: {
                    formatter: (val) => `${val} ${currency}`,
                },
            },
        });

        // Initialize the chart
        const chartElement = document.getElementById("pie-chart");
        const chart = new ApexCharts(chartElement, getChartOptions());
        chart.render();

        // Cleanup on unmount or dependencies change
        return () => {
            chart.destroy();
        };
    }, [balances, categories, currency]);

    return (
        <div className="w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
            <div className="flex justify-between items-start w-full">
                <div className="flex-col items-center">
                    <div className="flex items-center mb-1">
                        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white me-1">
                            Wallet Balance
                        </h5>
                    </div>
                </div>

                <Tooltip content="Piechart symbolizes amount of money currently saved in different categories." style="light">
                    <InfoIcon/>
                </Tooltip>
            </div>


            <div className="py-6" id="pie-chart"></div>
        </div>

    );
}
