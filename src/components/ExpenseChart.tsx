'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Transaction } from '@/types';
import { calculateTotalByType, formatCurrency } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ExpenseChartProps {
  transactions: Transaction[];
  chartType: 'expense' | 'income';
  timePeriod?: 'current' | 'threeMonthsAgo'; // Thêm prop mới
}

export function ExpenseChart({ transactions, chartType, timePeriod = 'current' }: ExpenseChartProps) {
  // Function để tạo dữ liệu 3 tháng gần nhất  
  const generateThreeMonthsAgoData = () => {
    const today = new Date();
    const dataPoints: number[] = [];
    const labels: string[] = [];
    
    // Tạo dữ liệu cho 3 tháng trước (không bao gồm tháng hiện tại)
    // Nếu hiện tại là tháng 8 thì hiển thị tháng 5, 6, 7
    // Nhưng cần lưu ý JavaScript Date sử dụng 0-based months
    for (let i = 1; i <= 3; i++) {
      // Fix: Cần +1 để match với ISO string format
      const targetMonth = today.getMonth() - (4 - i) + 1; // +1 để convert về 1-based
      const targetDate = new Date(today.getFullYear(), targetMonth - 1, 1); // -1 vì Date constructor cần 0-based
      const monthString = `${today.getFullYear()}-${String(targetMonth).padStart(2, '0')}`;
      
      // Tạo label cho tháng (format: "Th5", "Th6", "Th7")
      const monthLabel = `Th${targetMonth}`;
      labels.push(monthLabel);
      
      // Tính tổng giao dịch trong tháng đó
      const monthTransactions = transactions.filter(t => 
        t.date.startsWith(monthString) && t.type === chartType
      );
      const monthTotal = calculateTotalByType(monthTransactions, chartType);
      dataPoints.push(monthTotal);
    }

    const maxValue = Math.max(...dataPoints, 0);
    
    const calculateThreeLevelScale = (maxVal: number) => {
      if (maxVal === 0) return { max: 300000, step: 100000, unit: 'K' };
      
      const paddedMax = maxVal * 1.1;
      let finalMax;
      
      if (paddedMax < 1000000) {
        finalMax = Math.ceil(paddedMax / 100000) * 100000;
      } else {
        finalMax = Math.ceil(paddedMax / 1000000) * 1000000;
      }
      
      const step = Math.round(finalMax / 3);
      
      if (finalMax < 1000000) {
        return { max: finalMax, step: step, unit: 'K' };
      } else {
        return { max: finalMax, step: step, unit: 'M' };
      }
    };
    
    const scale = calculateThreeLevelScale(maxValue);

    return {
      labels: labels,
      datasets: [
        {
          label: chartType === 'expense' ? 'Chi tiêu 3 tháng trước' : 'Thu nhập 3 tháng trước',
          data: dataPoints,
          borderColor: chartType === 'expense' ? '#ef4444' : '#2563eb',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            
            if (!chartArea) {
              return null;
            }
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            if (chartType === 'expense') {
              gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)'); // Đỏ đậm hơn ở trên
              gradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.25)'); // Đỏ đậm hơn ở giữa
              gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)'); // Nhạt hơn nhưng vẫn có màu ở dưới
            } else {
              gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
              gradient.addColorStop(0.6, 'rgba(37, 99, 235, 0.1)');
              gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
            }
            return gradient;
          },
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'transparent',
          pointBorderColor: 'transparent',
          pointBorderWidth: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          spanGaps: false,
        },
      ],
      maxValue: scale.max,
      stepSize: scale.step,
      unit: scale.unit,
      periodInfo: { type: 'threeMonthsAgo', period: '3 tháng trước' }
    };
  };

  // Generate chart data based on time period
  const generateChartData = () => {
    // Nếu là 3 tháng trước, tạo logic mới
    if (timePeriod === 'threeMonthsAgo') {
      return generateThreeMonthsAgoData();
    }
    
    // Giữ nguyên logic cũ cho tháng hiện tại
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first and last day of current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Hiển thị cả tháng trên trục X nhưng chỉ có dữ liệu đến ngày hiện tại
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Chỉ hiển thị dữ liệu đến ngày hiện tại nếu đang trong tháng hiện tại
    const dataEndDay = (month === currentMonth && year === currentYear) 
      ? currentDay 
      : lastDay.getDate();
    
    const dataPoints = [];
    const labels = [];
    let cumulativeTotal = 0; // Tổng tích lũy
    
    // Tạo labels cho cả tháng (01/08 → 31/08)
    for (let day = 1; day <= lastDay.getDate(); day++) {
      labels.push(`${String(day).padStart(2, '0')}/08`);
    }
    
    // Tạo data points chỉ đến ngày hiện tại
    for (let day = 1; day <= dataEndDay; day++) {
      const date = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayTransactions = transactions.filter(t => 
        t.date === dateString && t.type === chartType
      );
      const dayTotal = calculateTotalByType(dayTransactions, chartType);
      
      // Cộng dồn để tạo biểu đồ tích lũy
      cumulativeTotal += dayTotal;
      dataPoints.push(cumulativeTotal);
    }
    
    // Phần còn lại của tháng để null (không hiển thị đường)
    for (let day = dataEndDay + 1; day <= lastDay.getDate(); day++) {
      dataPoints.push(null);
    }

    // Calculate max value to determine Y-axis scale with 3 levels
    const maxValue = Math.max(...dataPoints.filter(p => p !== null) as number[], 0);
    
    // Create dynamic scale algorithm with K and M support
    const calculateThreeLevelScale = (maxVal: number) => {
      if (maxVal === 0) return { max: 300000, step: 100000, unit: 'K' }; // Default: 100K, 200K, 300K
      
      // Add small padding (5-10%) then round up to nice number
      const paddedMax = maxVal * 1.1;
      
      // Simple rounding up to nice numbers
      let finalMax;
      if (paddedMax < 1000000) {
        // For values under 1M, round to nearest 100K above
        finalMax = Math.ceil(paddedMax / 100000) * 100000;
      } else {
        // For values 1M+, round to nearest 1M above  
        finalMax = Math.ceil(paddedMax / 1000000) * 1000000;
      }
      
      // Divide into exactly 3 equal parts
      const step = Math.round(finalMax / 3);
      
      // Determine unit
      if (finalMax < 1000000) {
        return { max: finalMax, step: step, unit: 'K' };
      } else {
        return { max: finalMax, step: step, unit: 'M' };
      }
    };
    
    const scale = calculateThreeLevelScale(maxValue);

    return {
      labels: labels,
      datasets: [
        {
          label: chartType === 'expense' ? 'Chi tiêu tích lũy' : 'Thu nhập tích lũy',
          data: dataPoints,
          borderColor: chartType === 'expense' ? '#ef4444' : '#2563eb', // Màu đỏ như trong ảnh
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            
            if (!chartArea) {
              return null;
            }
            
            // Tạo gradient từ trên xuống dưới
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            if (chartType === 'expense') {
              gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)'); // Đỏ đậm hơn ở trên
              gradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.25)'); // Đỏ đậm hơn ở giữa  
              gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');   // Nhạt hơn nhưng vẫn có màu ở dưới
            } else {
              gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
              gradient.addColorStop(0.6, 'rgba(37, 99, 235, 0.1)');
              gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
            }
            return gradient;
          },
          tension: 0.4, // Đường cong mềm mại
          fill: true, // Tô màu dưới đường như area chart
          stepped: false, // Không dùng step chart để có đường cong mềm
          pointBackgroundColor: 'transparent', // Ẩn chấm
          pointBorderColor: 'transparent', // Ẩn viền chấm
          pointBorderWidth: 0,
          pointRadius: 0, // Không hiển thị chấm
          pointHoverRadius: 0, // Không hiển thị chấm khi hover
          borderWidth: 2, // Đường đậm hơn
          spanGaps: false, // Không nối các khoảng trống
        },
      ],
      maxValue: scale.max,
      stepSize: scale.step,
      unit: scale.unit,
      periodInfo: { type: 'current', month: month + 1, year: year }
    };
  };

  const chartData = generateChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            const periodInfo = chartData.periodInfo;
            if (timePeriod === 'threeMonthsAgo') {
              // Với 3 tháng, hiển thị tên tháng trực tiếp từ label
              return context[0].label;
            } else {
              // Với tháng hiện tại, hiển thị ngày/tháng/năm
              const day = parseInt(context[0].label);
              const currentPeriodInfo = periodInfo as { type: string; month: number; year: number; };
              return `Ngày ${day}/${currentPeriodInfo.month}/${currentPeriodInfo.year}`;
            }
          },
          label: function(context: any) {
            const value = context.parsed.y;
            if (timePeriod === 'current') {
              return `${chartType === 'expense' ? 'Tổng chi tiêu' : 'Tổng thu nhập'} tháng này: ${formatCurrency(value)}`;
            } else {
              // Với 3 tháng, hiển thị theo từng tháng cụ thể
              const monthLabel = context.label; // "Th5", "Th6", "Th7"
              return `${chartType === 'expense' ? 'Tổng chi tiêu' : 'Tổng thu nhập'} của ${monthLabel}: ${formatCurrency(value)}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: chartData.maxValue,
        position: 'right' as const,
        ticks: {
          stepSize: chartData.stepSize,
          callback: function(value: any) {
            if (chartData.unit === 'K') {
              const thousands = Math.round(value / 1000);
              return thousands === 0 ? '0' : `${thousands}K`;
            } else {
              const millions = Math.round(value / 1000000);
              return millions === 0 ? '0' : `${millions}M`;
            }
          },
          color: '#6b7280',
          font: {
            size: 12,
          },
          // Force exactly 3 ticks (plus 0)
          count: 4, // 0, step, 2*step, 3*step
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          maxTicksLimit: 8, // Hiển thị các ngày chính
          callback: function(value: any, index: number) {
            const label = chartData.labels[index];
            
            if (timePeriod === 'current') {
              // Logic cũ cho tháng hiện tại - hiển thị ngày
              if (label === '01/08' || label === '05/08' || label === '10/08' || 
                  label === '15/08' || label === '20/08' || label === '25/08' || label === '31/08') {
                return label;
              }
            } else {
              // Logic mới cho 3 tháng - hiển thị tất cả tên tháng
              return label;
            }
            return '';
          }
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="w-full h-48">
      <Line data={chartData} options={options} />
    </div>
  );
}
