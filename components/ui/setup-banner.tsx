'use client'

import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function SetupBanner() {
  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              Setup Required
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              To use real authentication and data storage, you need to configure Supabase. 
              This takes about 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com', '_blank')}
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Set up Supabase
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/dashboard?demo=true'}
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                Continue with Demo
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}