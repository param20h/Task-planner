"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const [groqKey, setGroqKey] = useState("");
  const [name, setName] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load from local storage for now (mocking database)
    const savedKey = localStorage.getItem("momentum_groq_key");
    const savedName = localStorage.getItem("momentum_name");
    if (savedKey) setGroqKey(savedKey);
    if (savedName) setName(savedName);
  }, []);

  const handleSave = () => {
    localStorage.setItem("momentum_groq_key", groqKey);
    localStorage.setItem("momentum_name", name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-zinc-400 mt-2">Manage your account preferences and AI integrations.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-50">
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription className="text-zinc-400">
            How should Momentum refer to you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Alex" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-950 border-zinc-800"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-50">
        <CardHeader>
          <CardTitle>AI Integration (Groq)</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your Groq API key to power the AI coaching features. Your key is stored locally and securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groq_key">Groq API Key</Label>
            <Input 
              id="groq_key" 
              type="password"
              placeholder="gsk_..." 
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="bg-zinc-950 border-zinc-800 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-neutral-800 hover:bg-neutral-700 text-white gap-2">
          <Save className="h-4 w-4" />
          {isSaved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
