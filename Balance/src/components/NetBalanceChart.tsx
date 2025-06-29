import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface NetBalanceChartProps {
  data: { date: string; balance: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card text-card-foreground border border-border rounded-md shadow-lg">
        <p className="font-bold">{`Ngày: ${format(parseISO(label), 'dd-MM-yyyy')}`}</p>
        <p className="text-sm">{`Số dư: ${payload[0].value.toLocaleString('vi-VN')} VNĐ`}</p>
      </div>
    );
  }
  return null;
};

const NetBalanceChart: React.FC<NetBalanceChartProps> = ({ data }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Biểu Đồ Số Dư Tích Lũy</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-gray-500">Không có dữ liệu số dư để hiển thị biểu đồ.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(tick) => format(parseISO(tick), 'dd-MM')} />
              <YAxis tickFormatter={(tick) => tick.toLocaleString('vi-VN')} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default NetBalanceChart;