import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const PEDAGOGICAL_DECOMPOSITION_SYSTEM_PROMPT = `You are an expert in educational psychology and pedagogical analysis. Your task is to decompose an instructor's AI agent configuration into discrete, testable pedagogical components.

For each pedagogical component you identify, provide:

1. **Component Name**: Clear, descriptive name for the pedagogical behavior
2. **Component Description**: What specific teaching behavior this represents
3. **Source Lines**: Which line numbers from the prompt define this component
4. **Testable Behaviors**: Specific, observable actions the agent should demonstrate
5. **Failure Indicators**: How you would recognize if this component is not working

Focus on identifying components that represent distinct pedagogical approaches, such as:
- Student interaction styles (Socratic questioning, direct instruction, etc.)
- Feedback delivery methods 
- Boundary maintenance behaviors
- Misconception handling approaches
- Motivational techniques
- Content delivery strategies

Ensure each component is:
- **Specific**: Clearly defined behavior, not vague concepts
- **Observable**: Can be detected in conversation transcripts
- **Testable**: Can be validated through student interactions
- **Distinct**: Different from other identified components

Return your analysis as JSON in this format:
{
  "components": [
    {
      "name": "Component Name",
      "description": "What this component does",
      "sourceLines": [2, 8, 11],
      "testableBehaviors": ["Specific behavior 1", "Specific behavior 2"],
      "failureIndicators": ["How to detect failure 1", "How to detect failure 2"]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Pedagogical decomposition API called!');
    
    const body = await req.json();
    const { instructorPrompt } = body;

    if (!instructorPrompt) {
      return NextResponse.json(
        { error: 'Instructor prompt is required' },
        { status: 400 }
      );
    }

    console.log('📨 Received instructor prompt for decomposition');

    // Build the user prompt with line numbers
    const userPrompt = `Analyze the following instructor prompt and decompose it into testable pedagogical components:

=== INSTRUCTOR PROMPT ===
${instructorPrompt}
================================

Extract discrete pedagogical components that can be systematically tested.`;
    
    // Call AI SDK directly
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: PEDAGOGICAL_DECOMPOSITION_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0,
    });

    // Parse response
    let jsonText = result.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    const response = JSON.parse(jsonText);

    console.log('🎯 Pedagogical decomposition completed');

    return NextResponse.json({
      pedagogicalComponents: response.components
    });

  } catch (error) {
    console.error('❌ Error in pedagogical decomposition API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to decompose pedagogical components', details: errorMessage },
      { status: 500 }
    );
  }
}