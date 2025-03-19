"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Users, Flame, BarChart, MessagesSquare } from 'lucide-react'
import { StatsCard } from "@/components/dashboard/stats-card"
import { Lead } from "@/types/lead"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// Add these imports at the top
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LeadDetails } from "@/components/dashboard/lead-details"

export default function DashboardPage() {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin')
    },
  })

  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    }
  }

  const statsCards = [
    {
      icon: Users,
      title: "Total Leads",
      value: leads.length,
      description: "Active leads in pipeline"
    },
    {
      icon: Flame,
      title: "Hot Leads",
      value: leads.filter(l => l.interest === 'Hot').length,
      description: "High potential leads"
    },
    {
      icon: BarChart,
      title: "Conversion Rate",
      value: `${Math.round(leads.reduce((acc, curr) => acc + curr.score, 0) / leads.length || 0)}%`,
      description: "Average lead score"
    },
    {
      icon: MessagesSquare,
      title: "Conversations",
      value: leads.reduce((acc, curr) => acc + curr.conversations.length, 0),
      description: "Total interactions"
    }
  ]

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Lead Management</h1>
          <div className="flex items-center gap-4">
            {/* Add any header actions here */}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* New Lead Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Interest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  onClick={() => {
                    setSelectedLead(lead)
                    setIsDialogOpen(true)
                  }}
                >
                  <TableCell className="font-medium">{lead.name || 'Anonymous'}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      lead.interest === 'Hot' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      lead.interest === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      lead.interest === 'Warm' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {lead.interest}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden rounded-xl">
            <DialogTitle className="sr-only">Lead Details</DialogTitle>
            <div className="h-full overflow-hidden">
              <LeadDetails lead={selectedLead} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}