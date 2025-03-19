'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Code2, CheckCircle2, Blocks } from "lucide-react"
import { toast } from "sonner"
import { integrationCodes, type Framework } from "@/constants/integration-codes"
import { cn } from "@/lib/utils"

export default function SampleCodePage() {
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Code copied to clipboard!", {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8 px-4 md:px-6 lg:px-8">
      <Card className="shadow-lg border-2">
        <CardHeader className="border-b bg-muted/50 space-y-4">
          <div className="flex items-center gap-3">
            <Code2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Integration Guide</CardTitle>
              <CardDescription className="text-base mt-1">
                Learn how to integrate the chatbot widget into your application using different frameworks.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-muted/50 p-1">
              {(Object.keys(integrationCodes) as Framework[]).map((framework) => (
                <TabsTrigger 
                  key={framework} 
                  value={framework}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Blocks className="h-4 w-4" />
                    {framework.toUpperCase()}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-6">
              {(Object.entries(integrationCodes) as [Framework, string][]).map(([framework, code]) => (
                <TabsContent key={framework} value={framework}>
                  <Card className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Code2 className="h-5 w-5 text-primary" />
                        <CardTitle className="font-semibold">
                          {framework.toUpperCase()} Integration
                        </CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <pre className={cn(
                        "bg-muted/50 p-6 rounded-lg overflow-x-auto",
                        "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
                        "border-t"
                      )}>
                        <code className="text-sm font-mono">{code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}