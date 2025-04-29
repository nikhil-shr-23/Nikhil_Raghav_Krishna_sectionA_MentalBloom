'use client';

import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getEmotionStats, clearEmotionsFromStorage } from '@/lib/localStorageUtils';

interface EmotionData {
  date: string;
  happy?: number;
  sad?: number;
  angry?: number;
  anxious?: number;
  calm?: number;
  excited?: number;
}

interface EmotionChartProps {
  refreshTrigger: number;
}

export function EmotionChart({ refreshTrigger }: EmotionChartProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define chart configuration
  const chartConfig: ChartConfig = {
    happy: {
      label: 'Happy',
      color: 'hsl(var(--chart-1))',
    },
    sad: {
      label: 'Sad',
      color: 'hsl(var(--chart-2))',
    },
    angry: {
      label: 'Angry',
      color: 'hsl(var(--chart-3))',
    },
    anxious: {
      label: 'Anxious',
      color: 'hsl(var(--chart-4))',
    },
    calm: {
      label: 'Calm',
      color: 'hsl(var(--chart-5))',
    },
    excited: {
      label: 'Excited',
      color: 'hsl(var(--chart-6))',
    },
  };

  // Function to clear all emotion data
  const handleClearEmotions = () => {
    if (window.confirm('Are you sure you want to delete all your emotion data? This cannot be undone.')) {
      clearEmotionsFromStorage();
      setEmotionData([]);
    }
  };

  // Fetch emotion data from local storage
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      // Get data from local storage
      const stats = getEmotionStats(days);

      // Format data for chart
      setEmotionData(stats.daily_data || []);
    } catch (err) {
      console.error('Error fetching emotion data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch emotion data');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, refreshTrigger]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 space-y-2 border-b py-5 sm:flex-row sm:items-center sm:space-y-0">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Emotion Tracking</CardTitle>
          <CardDescription>
            Your emotional journey over time
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-full sm:w-[160px] rounded-lg"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={handleClearEmotions}
          >
            Clear Data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6BCB77]"></div>
          </div>
        ) : emotionData.length === 0 ? (
          <div className="flex justify-center items-center h-[250px] text-gray-500">
            No emotion data available. Start logging your emotions!
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={emotionData}>
              <defs>
                {Object.entries(chartConfig).map(([key, config]) => (
                  <linearGradient
                    key={key}
                    id={`fill${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                domain={[0, 10]}
                tickCount={6}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {Object.keys(chartConfig).map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  fill={`url(#fill${key.charAt(0).toUpperCase() + key.slice(1)})`}
                  stroke={`var(--color-${key})`}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
