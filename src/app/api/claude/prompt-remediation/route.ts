import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const PROMPT_REMEDIATION_SYSTEM_PROMPT = `You are an expert at improving AI teaching prompts based on failed pedagogical tests.

Your task is to provide a simple before/after suggestion that fixes the specific pedagogical issue.

REQUIREMENTS:
- Identify what specific content in the current prompt needs to change
- Provide improved content that addresses the pedagogical failure
- Keep changes focused and minimal
- Maintain the original prompt style and structure

Return JSON in this exact format:
{
  "before": "The specific current prompt content that needs changing",
  "after": "The improved content that addresses the pedagogical gap", 
  "explanation": "Brief explanation of why this change fixes the issue"
}`;

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Prompt remediation API called!');
    
    const body = await req.json();
    const { 
      failedTest, 
      currentPrompt, 
      pedagogicalComponent,
      conversationTranscript 
    } = body;

    if (!failedTest || !currentPrompt || !pedagogicalComponent) {
      return NextResponse.json(
        { error: 'Failed test, current prompt, and pedagogical component are required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Generating remediation for failed test: ${failedTest.testId}`);
    console.log(`📋 Component: ${pedagogicalComponent.name}`);
    console.log(`📍 Source lines: ${pedagogicalComponent.sourceLines.join(', ')}`);

    // Extract failed evaluation criteria details
    const failedCriteria = Object.entries(failedTest.evaluationResults)
      .filter(([_, result]: [string, any]) => result.result === 'failure')
      .map(([criteriaId, result]: [string, any]) => ({
        criteriaId,
        rationale: result.rationale
      }));

    // Get the specific lines that need fixing
    const promptLines = currentPrompt.split('\n');
    const relevantLines = pedagogicalComponent.sourceLines
      .map((lineNum: number) => `Line ${lineNum}: ${promptLines[lineNum - 1] || ''}`)
      .join('\n');

    // Build the user prompt
    const userPrompt = `Fix this AI teaching prompt based on a failed pedagogical test.

FAILED COMPONENT: ${pedagogicalComponent.name}
DESCRIPTION: ${pedagogicalComponent.description}

CURRENT RELEVANT CONTENT:
${relevantLines}

FAILURE REASONS:
${failedCriteria.map(criteria => `- ${criteria.rationale}`).join('\n')}

TEST CONTEXT:
- Student Type: ${failedTest.studentProfilePrompt?.substring(0, 150)}...
- Scenario: ${failedTest.scenarioOverview}
- What went wrong: ${failedTest.transcriptSummary}

Provide a simple before/after fix that addresses these specific failures. Focus on the content that needs to change and what it should become.`;
    
    // Call AI SDK
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: PROMPT_REMEDIATION_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.3,
      maxOutputTokens: 1000
    });

    // Parse response
    let jsonText = result.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    const response = JSON.parse(jsonText);

    console.log(`✅ Generated simple remediation suggestion`);
    console.log(`🎯 Change: ${response.before?.substring(0, 50)}... -> ${response.after?.substring(0, 50)}...`);

    return NextResponse.json({
      before: response.before,
      after: response.after,
      explanation: response.explanation
    });

  } catch (error) {
    console.error('❌ Error in prompt remediation API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to generate prompt remediation', details: errorMessage },
      { status: 500 }
    );
  }
}