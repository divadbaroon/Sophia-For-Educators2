import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const UNIT_TEST_GENERATION_SYSTEM_PROMPT = `You are an expert in educational testing and pedagogical evaluation. Your task is to generate comprehensive test scenarios that can detect pedagogical failures, not just validate existing behaviors.

CRITICAL REQUIREMENT: You must generate EXACTLY 3-5 test cases for each pedagogical component provided. These tests must be capable of identifying when pedagogical approaches fail or are inadequate.

RIGOROUS EVALUATION APPROACH:
- Create evaluation criteria based on established educational psychology principles, not just the agent's stated behaviors
- Design tests that can distinguish between excellent, adequate, and poor pedagogical responses
- Generate challenging scenarios that typically cause pedagogical agents to fail
- Focus on student learning outcomes and emotional impact, not just procedural compliance

For each pedagogical component provided, you will:
1. Select 3-5 different student profile and scenario combinations that would stress-test the component
2. Generate conversation starters that create pedagogical challenges and edge cases
3. Create strict evaluation criteria that expect specific, measurable pedagogical excellence

SELECTION CRITERIA:
- Choose student profiles that would challenge or potentially break the pedagogical behavior
- Select scenarios that create pedagogical dilemmas or competing priorities
- Include edge cases where the component might reasonably fail
- Test boundary conditions and conflicting student needs

CONVERSATION STARTERS:
- Should create pedagogical tension or difficulty
- Include challenging student behaviors (resistance, confusion, frustration)
- Present situations where generic responses would clearly fail
- Reflect authentic problematic student interactions

EVALUATION CRITERIA:
- Must be strict enough to distinguish excellent from merely adequate responses
- Should expect specific evidence of pedagogical techniques, not just general helpfulness
- Include multiple observable behaviors that must all be present for success
- Focus on student experience and learning impact, not agent process compliance
- Criteria should fail if the agent provides technically correct but pedagogically poor responses

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
          "conversationGoalPrompt": "The agent demonstrated specific pedagogical excellence (not just basic helpfulness)",
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

    // Build the user prompt with all available data
    const userPrompt = `Generate comprehensive test scenarios for the following pedagogical components. 
IMPORTANT: Generate 3-5 distinct test cases for EACH component listed below.

=== PEDAGOGICAL COMPONENTS ===
${pedagogicalComponents.map((comp: any, idx: any) => 
  `${idx + 1}. ${comp.name}: ${comp.description}`
).join('\n')}

=== AVAILABLE STUDENT PROFILES ===
${studentProfiles.map((profile: any, idx: any) => 
  `${idx + 1}. ${profile.id}: ${profile.prompt.substring(0, 150)}...`
).join('\n')}

=== AVAILABLE SCENARIOS ===
${scenarioTemplates.map((scenario: any, idx: any) => 
  `${idx + 1}. ${scenario.scenarioId}: ${scenario.overview}`
).join('\n')}

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

    return NextResponse.json({
      testCases: response.testCases,
      summary: {
        componentsProcessed: pedagogicalComponents.length,
        testCasesGenerated: response.testCases?.length || 0,
        profilesAvailable: studentProfiles.length,
        scenariosAvailable: scenarioTemplates.length
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