'use client'

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3,
  LineChart as LineChartIcon} from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Badge } from "@/components/ui/badge"

interface Lead {
  id: string
  email: string
  score: number
  interest: string
  messageInsights: {
    projectScope: string
    technicalNeeds: string
    timeframe: string
    budgetIndication: string
  }
  engagement: {
    messageCount: number
    durationMinutes: number
    lastActivity: Date
  }
  closeChance: string
}

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads')
        const data = await response.json()
        setLeads(data)
      } catch (error) {
        console.error('Failed to fetch leads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const scoreData = leads.map(lead => ({
    name: lead.email,
    "Lead Score": lead.score,
  }))

  const interestDistribution = leads.reduce((acc, lead) => {
    acc[lead.interest] = (acc[lead.interest] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const interestData = Object.entries(interestDistribution).map(([name, value]) => ({
    name,
    "Leads": value
  }))

  const engagementData = leads.map(lead => ({
    name: lead.email,
    "Messages": lead.engagement.messageCount,
    "Duration (min)": lead.engagement.durationMinutes
  }))

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="w-full bg-gradient-to-br from-background to-muted/50">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 space-y-8 px-4 min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor and analyze your lead engagement metrics
        </p>
      </div>

      <Card className="shadow-xl border-2 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-muted/80 to-muted/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Lead Analytics
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Detailed analysis of lead engagement and performance metrics
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-semibold px-4 py-1.5 bg-background/50 backdrop-blur-sm">
              Last 30 Days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Tabs defaultValue="scores" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 gap-6 bg-muted/30 p-1.5 rounded-lg">
              <TabsTrigger 
                value="scores" 
                className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-200 rounded-md py-3"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  Lead Scores
                </div>
              </TabsTrigger>
              <TabsTrigger value="interest" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Interest Distribution
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                Engagement Metrics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scores">
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 p-6">
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/60" />
                      <XAxis 
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#888888' }}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fill: '#888888' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                        cursor={{ fill: 'hsl(var(--muted))' }}
                      />
                      <Bar
                        dataKey="Lead Score"
                        fill="currentColor"
                        radius={[8, 8, 0, 0]}
                        className="fill-primary/70 hover:fill-primary transition-colors duration-200"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="interest">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={interestData}>
                      <XAxis 
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="Leads"
                        fill="currentColor"
                        radius={[6, 6, 0, 0]}
                        className="fill-rose-400 hover:fill-rose-500 transition-colors duration-200"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="engagement">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={engagementData}>
                      <XAxis 
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="Messages"
                        strokeWidth={3}
                        className="stroke-emerald-400"
                        dot={{ strokeWidth: 3 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Duration (min)"
                        strokeWidth={3}
                        className="stroke-blue-400"
                        dot={{ strokeWidth: 3 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}