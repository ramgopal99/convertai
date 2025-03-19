import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Clock, Building2, Phone } from 'lucide-react';
import { Lead } from "@/types/lead";

interface LeadDetailsProps {
  lead: Lead | null;
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  if (!lead) {
    return (
      <Card className="h-full border-none shadow-lg bg-white dark:bg-zinc-900 rounded-xl">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-full inline-block animate-pulse">
              <User className="w-12 h-12 text-zinc-400" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Lead Selected</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a lead from the list to view details</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-lg bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
      <CardHeader className="p-6 border-b dark:border-zinc-800 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <User className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{lead.name || 'Anonymous'}</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{lead.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium">
              Score: {lead.score}%
            </div>
            <div className={`text-sm px-3 py-1.5 rounded-lg font-medium ${
              lead.interest === 'Hot' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
              lead.interest === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
              lead.interest === 'Warm' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {lead.interest}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pb-8">
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-8 pb-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Company</p>
                </div>
                <p className="text-zinc-900 dark:text-zinc-100">{lead.company || 'Not specified'}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Phone</p>
                </div>
                <p className="text-zinc-900 dark:text-zinc-100">{lead.phone || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Conversation History</h3>
              <div className="space-y-8">
                {lead.conversations.map((conv, index) => (
                  <div key={conv.id} className={`space-y-4 ${
                    index === lead.conversations.length - 1 ? 'mb-4' : ''
                  }`}>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <time>{new Date(conv.timestamp).toLocaleString()}</time>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="justify-self-start max-w-[80%]">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl rounded-tl-none shadow-sm">
                          <p className="text-zinc-900 dark:text-zinc-100">{conv.message}</p>
                        </div>
                      </div>
                      <div className="justify-self-end max-w-[80%]">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl rounded-br-none shadow-sm">
                          <p className="text-zinc-900 dark:text-zinc-100">{conv.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}