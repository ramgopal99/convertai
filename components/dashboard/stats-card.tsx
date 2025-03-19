import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
}

export function StatsCard({ icon: Icon, title, value }: StatsCardProps) {
  return (
    <Card className="border transition-colors duration-200 dark:bg-zinc-900 bg-white hover:bg-zinc-50 dark:hover:bg-zinc-800/80">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Icon className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        </div>
        <p className="text-3xl font-bold mt-4 text-zinc-900 dark:text-white">{value}</p>
      </CardContent>
    </Card>
  );
}