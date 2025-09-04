import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const UNIT_TEST_GENERATION_SYSTEM_PROMPT = `You are an expert in educational testing and pedagogical evaluation. Your task is to generate comprehensive test scenarios for pedagogical components using authentic student profiles and realistic programming scenarios.

CRITICAL REQUIREMENT: You must generate EXACTLY 3-5 test cases for each pedagogical component provided. This is non-negotiable for comprehensive validation coverage.

For each pedagogical component provided, you will:
1. Select 3-5 different student profile and scenario combinations that would meaningfully test the component
2. Generate conversation starters that trigger the specific pedagogical behavior
3. Create evaluation criteria to assess whether the component functions correctly

SELECTION CRITERIA:
- Choose student profiles whose characteristics would naturally encounter the pedagogical behavior
- Select scenarios that provide appropriate context for the component to be demonstrated  
- Ensure diverse coverage across different student types and error contexts
- Avoid redundant combinations that test the same pedagogical interaction
- Each test case must test a different aspect or situation for the component

CONVERSATION STARTERS:
- Must naturally trigger the pedagogical component being tested
- Should reflect the selected student profile's communication style and knowledge level
- Include reference to the scenario's code/error context when relevant
- Sound like authentic student questions or statements

EVALUATION CRITERIA:
- Specific to the pedagogical component being tested
- Observable through conversation analysis
- Measurable as success/failure with clear rationale
- Focus on pedagogical appropriateness, not just technical correctness

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
          "conversationGoalPrompt": "The agent demonstrated the expected pedagogical behavior",
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