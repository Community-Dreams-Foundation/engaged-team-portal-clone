
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { PortfolioItem } from "@/types/portfolio"

interface VisualSummaryProps {
  data: PortfolioItem[];
}

export function VisualSummary({ data }: VisualSummaryProps) {
  const chartData = data.map(item => ({
    name: item.title,
    efficiency: item.impact.efficiency,
    timeEfficiency: item.impact.timeEfficiency,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiency" fill="#9b87f5" name="Overall Efficiency" />
              <Bar dataKey="timeEfficiency" fill="#7E69AB" name="Time Efficiency" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
