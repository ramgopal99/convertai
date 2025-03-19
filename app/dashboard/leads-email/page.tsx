
'use client'

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Eye } from "lucide-react"

interface EmailHistory {
  id: string
  email: string
  content: string
  sentAt: Date
  lead: {
    name: string | null
    company: string | null
  } | null
}

export default function LeadsEmailPage() {
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null)

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/email-history')
        const data = await response.json()
        setEmailHistory(data)
      } catch (error) {
        console.error('Failed to fetch email history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [])

  return (
    <>
      <div className="container mx-auto py-6 space-y-6 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Email History</CardTitle>
            <CardDescription>
              View all emails sent to leads. Click on any row to view the full content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[50px]">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : emailHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No emails sent yet
                    </TableCell>
                  </TableRow>
                ) : (
                  emailHistory.map((history) => (
                    <TableRow 
                      key={history.id} 
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="font-medium">{history.email}</TableCell>
                      <TableCell>{history.lead?.name || 'N/A'}</TableCell>
                      <TableCell>{history.lead?.company || 'N/A'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(history.sentAt), 'PPpp')}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {history.content}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedEmail(history)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="space-y-4">
              <div className="text-xl font-semibold">Email Details</div>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-2 font-medium text-foreground">To:</span>
                  <span className="col-span-10">{selectedEmail?.email}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-2 font-medium text-foreground">Sent:</span>
                  <span className="col-span-10">
                    {selectedEmail && format(new Date(selectedEmail.sentAt), 'PPpp')}
                  </span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-2 font-medium text-foreground">Lead:</span>
                  <span className="col-span-10">{selectedEmail?.lead?.name || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-2 font-medium text-foreground">Company:</span>
                  <span className="col-span-10">{selectedEmail?.lead?.company || 'N/A'}</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Email Content:</h3>
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
              {selectedEmail?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}