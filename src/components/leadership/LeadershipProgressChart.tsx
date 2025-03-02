
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LeadershipMetrics } from '@/types/leadership';

interface LeadershipProgressChartProps {
  metrics: Partial<LeadershipMetrics>;
  title?: string;
}

export function LeadershipProgressChart({ metrics, title = "Leadership Progress" }: LeadershipProgressChartProps) {
  // Prepare data for the pie chart
  const data = [
    { name: 'Team Efficiency', value: metrics.teamEfficiency || 0, color: '#4f46e5' },
    { name: 'Task Completion', value: metrics.delegationAccuracy || 0, color: '#06b6d4' },
    { name: 'Innovation', value: metrics.innovationScore || 0, color: '#22c55e' },
    { name: 'Communication', value: metrics.communicationScore || 0, color: '#eab308' },
    { name: 'Mentorship', value: metrics.mentorshipScore || 0, color: '#ec4899' },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
