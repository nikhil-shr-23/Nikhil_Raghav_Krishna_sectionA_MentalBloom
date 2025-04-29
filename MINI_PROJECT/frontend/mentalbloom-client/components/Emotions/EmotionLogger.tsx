'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveEmotionToStorage } from '@/lib/localStorageUtils';

const EMOTIONS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
];

interface EmotionLoggerProps {
  onEmotionLogged: () => void;
}

export function EmotionLogger({ onEmotionLogged }: EmotionLoggerProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmotion) {
      setError('Please select an emotion');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save to local storage instead of API
      saveEmotionToStorage({
        emotion: selectedEmotion,
        intensity,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString(),
        user_id: localStorage.getItem('userId') || undefined
      });

      // Reset form
      setSelectedEmotion('');
      setIntensity(5);
      setNotes('');

      // Notify parent component
      onEmotionLogged();

    } catch (err) {
      console.error('Error logging emotion:', err);
      setError(err instanceof Error ? err.message : 'Failed to log emotion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Log your current emotional state</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base">Select your emotion</Label>
              <RadioGroup
                value={selectedEmotion}
                onValueChange={setSelectedEmotion}
                className="grid grid-cols-3 gap-4 mt-2"
              >
                {EMOTIONS.map((emotion) => (
                  <div key={emotion.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={emotion.value} id={emotion.value} />
                    <Label htmlFor={emotion.value} className="flex items-center cursor-pointer">
                      <span className="mr-2 text-xl">{emotion.emoji}</span>
                      {emotion.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base">Intensity: {intensity}</Label>
              <Slider
                value={[intensity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setIntensity(value[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Intense</span>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="What's making you feel this way?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !selectedEmotion}
          className="w-full bg-[#6BCB77] hover:bg-[#5ab868]"
        >
          {isLoading ? 'Logging...' : 'Log Emotion'}
        </Button>
      </CardFooter>
    </Card>
  );
}
