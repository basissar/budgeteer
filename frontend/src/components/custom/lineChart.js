import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";

export default function LineChart({totalWallet, sums, currency, height, width}) {
    const [showChart, setShowChart] = useState(true);

    useEffect(() => {
        const allPositiveSumsZero = sums.every(sum => sum.positiveSum === 0);
        const allNegativeSumsZero = sums.every(sum => sum.negativeSum === 0);

        if (allPositiveSumsZero && allNegativeSumsZero) {
            setShowChart(false);
        } else {
            setShowChart(true);
        }

        const options = {
            series: [
                {
                    name: "Income",
                    color: "#31C48D",
                    data: sums.map(sum => sum.positiveSum),
                },
                {
                    name: "Expense",
                    data: sums.map(sum => sum.negativeSum),
                    color: "#F05252",
                }
            ],
            chart: {
                sparkline: {
                    enabled: false,
                },
                type: "bar",
                width: width,
                height: height,
                toolbar: {
                    show: false,
                }
            },
            fill: {
                opacity: 1,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    columnWidth: "100%",
                    borderRadiusApplication: "end",
                    borderRadius: 6,
                    dataLabels: {
                        position: "top",
                    },
                },
            },
            legend: {
                show: true,
                position: "bottom",
            },
            dataLabels: {
                enabled: false,
            },
            tooltip: {
                shared: true,
                intersect: false,
                formatter: function (value) {
                    return currency + ' ' + value;
                }
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        fontFamily: "Inter, sans-serif",
                        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                    },
                    formatter: function (value) {
                        return currency + ' ' + value;
                    }
                },
                categories: sums.map(sum => sum.date),
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
            },
            yaxis: {
                labels: {
                    show: true,
                    style: {
                        fontFamily: "Inter, sans-serif",
                        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                    }
                }
            },
            grid: {
                show: true,
                strokeDashArray: 4,
                padding: {
                    left: 2,
                    right: 2,
                    top: -20
                },
            },
            fill: {
                opacity: 1,
            }
        }

        if (document.getElementById("bar-chart") && typeof ApexCharts !== 'undefined') {
            const chart = new ApexCharts(document.getElementById("bar-chart"), options);
            chart.render();
        }


        return () => {
            if (document.getElementById("bar-chart")) {
                ApexCharts.exec("bar-chart", "destroy");
            }
        };
    }, []);

    return (

        <div class=" w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
            <div class="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
                <dl>
                    <dt class="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">Total</dt>
                    <dd class="leading-none text-3xl font-bold text-gray-900 dark:text-white">{currency} {totalWallet}</dd>
                </dl>
            </div>

            {showChart ? (
                <div id="bar-chart"></div>
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                    <p>No expenses or incomes were recorded for the selected date range.</p>
                </div>
            )}
        </div>

    );
};
