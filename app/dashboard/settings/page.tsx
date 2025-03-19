'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  services: z.string().min(10, "Services must be at least 10 characters."),
  caseStudies: z.string().min(10, "Case studies must be at least 10 characters."),
  specialOffers: z.string().min(10, "Special offers must be at least 10 characters."),
  promptTemplate: z.string().min(10, "Prompt template must be at least 10 characters."),
})

export default function Settings() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      description: "",
      services: "",
      caseStudies: "",
      specialOffers: "",
      promptTemplate: `You are a friendly and professional AI assistant for {companyName}. Your primary goal is to collect lead information while discussing our tech solutions.

1. If you don't have the visitor's information, politely ask for:
   - Their name
   - Email address
   - Phone number
   - Company name (if applicable)
   - Their specific tech needs

2. Once you have their contact info, focus on:
   - Understanding their tech requirements
   - Explaining how we can help with: {services}
   - Sharing relevant case studies: {caseStudies}
   - Creating urgency through special offers: {specialOffers}

Company Description: {description}

Keep responses concise and friendly. Always acknowledge their information when provided and smoothly transition to the next question or topic.`,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data) {
          form.reset(data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 md:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>
            Configure your company details and AI chat prompt settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter company description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter services (one per line)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List your services, one per line
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caseStudies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Studies</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter case studies"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialOffers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Offers</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter special offers"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promptTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Prompt Template</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter AI prompt template"
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use {'{placeholders}'} for dynamic content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}