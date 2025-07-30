'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

const questions = [
  'What is artificial intelligence?',
  'Write a poem about nature.',
  'Give me a recipe for chocolate cake.',
  'Create Python code for web scraping.',
  'How do electric cars work?',
  'Explain Einstein\'s theory of relativity.',
];

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="mb-8">
      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full relative"
      >
        <CarouselContent>
          {questions.map((question, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onQuestionClick(question)}
                >
                  <CardContent className="flex h-24 items-center justify-center p-4">
                    <span className="text-sm font-medium text-center">{question}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
}
