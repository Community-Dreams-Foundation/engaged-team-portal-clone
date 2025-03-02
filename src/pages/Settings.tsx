
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { LeadershipSettings } from "@/components/leadership/LeadershipSettings";

const Settings = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your profile information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Profile settings will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="leadership">
            <LeadershipSettings />
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your security settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Security settings will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
