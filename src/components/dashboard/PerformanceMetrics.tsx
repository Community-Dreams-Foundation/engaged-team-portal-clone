
import { useState } from "react"
import { Trophy, TrendingUp, Target, Medal, Star, Award, BarChart as ChartIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { fetchPerformanceData, addPersonalGoal } from "@/utils/performanceUtils"
import type { PersonalGoal } from "@/types/performance"

export function PerformanceMetrics() {
  const { currentUser } = useAuth()
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: 0,
    current: 0, // Add this line to fix the TypeScript error
    type: "tasks" as const,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week from now
  })

  const { data: performance, refetch } = useQuery({
    queryKey: ['performanceData', currentUser?.uid],
    queryFn: () => fetchPerformanceData(currentUser?.uid || ''),
    enabled: !!currentUser,
  })

  const handleAddGoal = async () => {
    if (!currentUser) return;
    
    try {
      await addPersonalGoal(currentUser.uid, newGoal);
      toast({
        title: "Goal Added",
        description: "Your new personal goal has been set!",
      });
      refetch();
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add goal. Please try again.",
      });
    }
  };

  if (!performance) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          Loading performance data...
        </div>
      </Card>
    );
  }

  const experienceProgress = (performance.experience / performance.experienceToNextLevel) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Performance & Achievements
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set a Personal Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      placeholder="Complete 10 tasks this week"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Number</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="10"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">
                    Add Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Level and Experience Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Level {performance.level}</span>
                </div>
                <Badge variant="secondary">
                  {performance.experience} / {performance.experienceToNextLevel} XP
                </Badge>
              </div>
              <Progress value={experienceProgress} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold">{performance.efficiency}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Rank</span>
                  </div>
                  <p className="text-2xl font-bold">#{performance.leaderboardRank}</p>
                  <p className="text-xs text-muted-foreground">
                    of {performance.totalParticipants} participants
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Tasks Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ChartIcon className="h-4 w-4" />
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performance.weeklyTasks}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="tasks" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Personal Goals */}
            {performance.goals.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Personal Goals</h4>
                <div className="space-y-2">
                  {performance.goals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{goal.title}</span>
                            <Badge variant="secondary">
                              {goal.current} / {goal.target}
                            </Badge>
                          </div>
                          <Progress 
                            value={(goal.current / goal.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recent Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {performance.achievements.map((achievement) => (
                  <Badge 
                    key={achievement.id} 
                    variant="outline" 
                    className="flex items-center gap-1"
                  >
                    <Medal className="h-3 w-3" />
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
