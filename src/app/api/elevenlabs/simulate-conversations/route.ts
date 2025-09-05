import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 ElevenLabs simulation API called!');
    
    const body = await req.json();
    const { agentId, preparedTests } = body;

    if (!agentId || !preparedTests || !Array.isArray(preparedTests)) {
      return NextResponse.json(
        { error: 'Agent ID and prepared tests array are required' },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY,
    });

    const REALISTIC_STUDENT_PROMPT = `You are a college student asking for help with programming. 

CRITICAL INSTRUCTIONS FOR REALISTIC RESPONSES:
1. Keep responses SHORT - most real students write 1-3 sentences at a time
2. Use informal language and common student phrases:
   - "um", "uh", "like", "I guess"
   - "idk" instead of "I don't know"
   - "kinda", "sorta", "yeah"
   - Lowercase text, minimal punctuation

3. Show thinking through pauses and fragments:
   - "so... I tried this thing but..."
   - "wait let me think"
   - "hmm okay so"
   - Use "..." for pauses

4. Express frustration naturally:
   - "ugh this is so confusing"
   - "i keep getting this error and idk why"
   - "this makes no sense"

5. DON'T be overly polite or formal:
   - Skip "Thank you so much for your help!"
   - Avoid "I appreciate your assistance"
   - No long explanations of what you've tried

6. Typical message lengths:
   - First message: 1-2 sentences
   - Follow-ups: Often just a phrase or question
   - Never more than 3-4 sentences unless sharing code

AUTHENTIC EXAMPLES FROM REAL STUDENTS:
- "hey can u help me with this binary tree thing"
- "i dont get why my code isnt working"
- "wait so... how does that work exactly"
- "ugh nevermind i think i got it... actually no still confused"
- "can you just show me what you mean"`;


    console.log(`📨 Running ${preparedTests.length} simulations concurrently...`);

    // Execute all simulations concurrently
    const simulationPromises = preparedTests.map(async (test) => {
      try {
        console.log(`🔄 Starting simulation for test: ${test.testId}`);

        const response = await elevenlabs.conversationalAi.agents.simulateConversation(agentId, {
          simulationSpecification: {
            simulatedUserConfig: {
              prompt: {
                prompt: REALISTIC_STUDENT_PROMPT + "\n\nYour specific profile: " + test.studentProfilePrompt,
                llm: test.simulatedUserConfig.prompt.llm,
                temperature: test.simulatedUserConfig.prompt.temperature,
              },
              firstMessage: test.conversationStarter
            },
            dynamicVariables: {
              task_description: test.agentContext.task_description,
              student_code: test.agentContext.student_code,
              execution_output: test.agentContext.execution_output,
            },
          },
          extraEvaluationCriteria: test.evaluationCriteria.map((criteria: any) => ({
            id: criteria.id,
            name: criteria.name,
            conversationGoalPrompt: criteria.conversationGoalPrompt,
            useKnowledgeBase: criteria.useKnowledgeBase || false,
          })),
          newTurnsLimit: 10
        });

        console.log(`✅ Simulation completed for test: ${test.testId}`);
        
        return {
          testId: test.testId,
          componentName: test.componentName,
          selectedProfileId: test.selectedProfileId,
          selectedScenarioId: test.selectedScenarioId,
          success: true,
          conversation: response.simulatedConversation,
          analysis: response.analysis,
          evaluationResults: response.analysis?.evaluationCriteriaResults || {}
        };

      } catch (error) {
        console.error(`❌ Error in simulation for test ${test.testId}:`, error);
        return {
          testId: test.testId,
          componentName: test.componentName,
          selectedProfileId: test.selectedProfileId,
          selectedScenarioId: test.selectedScenarioId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Wait for all simulations to complete
    const simulationResults = await Promise.all(simulationPromises);
    
    // Separate successful and failed tests
    const successfulTests = simulationResults.filter(result => result.success);
    const failedTests = simulationResults.filter(result => !result.success);

    console.log(`✅ Completed ${successfulTests.length} successful simulations`);
    console.log(`❌ ${failedTests.length} simulations failed`);

    return NextResponse.json({
      results: simulationResults,
      summary: {
        totalTests: preparedTests.length,
        successful: successfulTests.length,
        failed: failedTests.length,
        successRate: (successfulTests.length / preparedTests.length) * 100
      }
    });

  } catch (error) {
    console.error('❌ Error in ElevenLabs simulation API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to run ElevenLabs simulations', details: errorMessage },
      { status: 500 }
    );
  }
}