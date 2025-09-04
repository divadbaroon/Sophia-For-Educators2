import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const UNIT_TEST_GENERATION_SYSTEM_PROMPT = `You are an expert in educational testing and pedagogical evaluation. Your task is to generate comprehensive test scenarios that evaluate contextually appropriate pedagogical responses.

CRITICAL REQUIREMENT: You must generate EXACTLY 3-5 test cases for each pedagogical component provided.

CONTEXT-AWARE EVALUATION PHILOSOPHY:
- Good teaching adapts to student needs, context, and learning situations
- Rigid application of pedagogical techniques regardless of context is poor teaching
- Evaluation criteria must consider what is pedagogically appropriate for the specific situation
- Focus on whether the agent's response serves the student's learning needs in that moment

EVALUATION CRITERIA PRINCIPLES:
- Judge whether the agent's response is contextually appropriate for the student's needs
- Consider the student's emotional state, time pressure, and specific questions
- Evaluate pedagogical quality within the context of the conversation
- Don't penalize agents for not using techniques that would be inappropriate for the situation
- Focus on adaptive teaching behaviors rather than rigid technique application

For each pedagogical component provided, you will:
1. Select 3-5 different student profile and scenario combinations that meaningfully test the component
2. Generate conversation starters that create realistic pedagogical situations
3. Create contextually aware evaluation criteria that judge appropriateness of the agent's response

CONVERSATION STARTERS:
- Must reflect authentic student interactions and needs
- Should vary in context (urgent help, conceptual confusion, general questions)
- Include different emotional states and learning situations
- Present scenarios where the component should naturally be demonstrated

EVALUATION CRITERIA REQUIREMENTS:
- Must consider the context of the student's request and emotional state
- Should evaluate whether the agent's response appropriately serves the student's needs
- Focus on pedagogical appropriateness rather than technique checklist compliance
- Criteria should recognize that different situations call for different teaching approaches
- Judge adaptive teaching behavior that responds to context

EXAMPLES OF CONTEXTUALLY APPROPRIATE CRITERIA:

For a stressed student asking urgent implementation help:
✅ "Agent provides focused guidance appropriate to the student's time pressure while maintaining educational value"
✅ "Agent balances efficiency with learning by explaining key concepts without overwhelming detail"

For a student asking basic formatting questions:
✅ "Agent provides clear, accurate information appropriate to the student's specific questions"
✅ "Agent offers additional related help when contextually appropriate"

For a confused student with conceptual gaps:
✅ "Agent identifies and addresses the student's specific misconceptions"
✅ "Agent checks understanding through questions when appropriate to the conversation flow"

EXAMPLES OF POOR CONTEXT-BLIND CRITERIA:
❌ "Agent asks verification questions" (inappropriate if student asked straightforward factual questions)
❌ "Agent provides industry examples" (inappropriate if student needs urgent implementation help)
❌ "Agent uses guided discovery" (inappropriate for basic syntax questions)

Return your analysis as JSON in this format:
{
  "testCases": [
    {
      "componentName": "Component being tested",
      "testId": "unique_test_identifier",
      "selectedProfileId": "profile_id_from_available_profiles",
      "selectedScenarioId": "scenario_id_from_available_scenarios", 
      "conversationStarter": "What the student says to trigger the component",
      "evaluationCriteria": [
        {
          "id": "criteria_identifier",
          "name": "Human Readable Name",
          "conversationGoalPrompt": "The agent responded appropriately to the student's needs and context, demonstrating good pedagogical judgment for this specific situation",
          "useKnowledgeBase": false
        }
      ]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Unit test generation API called!');
    
    const body = await req.json();
    const { pedagogicalComponents, studentProfiles, scenarioTemplates } = body;

    if (!pedagogicalComponents || !studentProfiles || !scenarioTemplates) {
      return NextResponse.json(
        { error: 'Pedagogical components, student profiles, and scenario templates are required' },
        { status: 400 }
      );
    }

    console.log(`📨 Generating tests for ${pedagogicalComponents.length} pedagogical components`);
    
    // Debug: Log what we received
    console.log('🔍 Debug - Received data types:');
    console.log('pedagogicalComponents:', Array.isArray(pedagogicalComponents), pedagogicalComponents?.length);
    console.log('studentProfiles:', Array.isArray(studentProfiles), typeof studentProfiles);
    console.log('scenarioTemplates:', Array.isArray(scenarioTemplates), scenarioTemplates?.length);
    
    // Ensure all required data is arrays
    if (!Array.isArray(studentProfiles)) {
      console.error('❌ studentProfiles is not an array:', studentProfiles);
      return NextResponse.json(
        { error: 'Student profiles must be an array' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(scenarioTemplates)) {
      console.error('❌ scenarioTemplates is not an array:', scenarioTemplates);
      return NextResponse.json(
        { error: 'Scenario templates must be an array' },
        { status: 400 }
      );
    }

    // Build the user prompt with all available data
    const userPrompt = `Generate comprehensive test scenarios for the following pedagogical components. 
IMPORTANT: Generate 3-5 distinct test cases for EACH component listed below.

CRITICAL: Create contextually appropriate evaluation criteria. Consider what would be pedagogically sound given the student's specific situation, emotional state, and type of question.

=== PEDAGOGICAL COMPONENTS ===
${pedagogicalComponents.map((comp: any, idx: any) => 
  `${idx + 1}. ${comp.name}: ${comp.description}
     Testable Behaviors: ${comp.testableBehaviors?.join(', ') || 'Not specified'}
     Failure Indicators: ${comp.failureIndicators?.join(', ') || 'Not specified'}`
).join('\n')}

=== AVAILABLE STUDENT PROFILES ===
${studentProfiles.map((profile: any, idx: any) => 
  `${idx + 1}. ${profile.id}: ${profile.prompt.substring(0, 150)}...`
).join('\n')}

=== AVAILABLE SCENARIOS ===
${scenarioTemplates.map((scenario: any, idx: any) => 
  `${idx + 1}. ${scenario.scenarioId}: ${scenario.overview}`
).join('\n')}

CONTEXT-AWARE EVALUATION RULES:
- Judge whether the agent's response appropriately serves the student's needs in their specific situation
- Consider the student's emotional state, time constraints, and type of question
- Don't penalize agents for not using techniques inappropriate to the context
- Evaluate adaptive teaching that responds to the student's actual needs
- Focus on pedagogical appropriateness rather than rigid technique compliance

REMEMBER: You must generate 3-5 test cases per pedagogical component to ensure comprehensive validation coverage. Total expected test cases: ${pedagogicalComponents.length * 3}-${pedagogicalComponents.length * 5}`;
    
    // Call AI SDK directly
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: UNIT_TEST_GENERATION_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0,
      maxOutputTokens: 8000
    });

    // Parse response
    let jsonText = result.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    const response = JSON.parse(jsonText);

    console.log(`🎯 Generated ${response.testCases?.length || 0} test cases`);
    console.log('📋 Test case breakdown:');
    
    // Log breakdown by component for debugging
    const componentBreakdown = response.testCases?.reduce((acc: any, test: any) => {
      acc[test.componentName] = (acc[test.componentName] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Component test counts:', componentBreakdown);

    return NextResponse.json({
      testCases: response.testCases,
      summary: {
        componentsProcessed: pedagogicalComponents.length,
        testCasesGenerated: response.testCases?.length || 0,
        profilesAvailable: studentProfiles.length,
        scenariosAvailable: scenarioTemplates.length,
        componentBreakdown
      }
    });

  } catch (error) {
    console.error('❌ Error in unit test generation API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to generate unit tests', details: errorMessage },
      { status: 500 }
    );
  }
}