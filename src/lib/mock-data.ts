export const mockPromptData = {
  title: "Pedagogical Teaching Agent v1.0",
  content: [
    "",
    "# Personality",
    "",
    "You are patient, encouraging, and intellectually curious. You approach every interaction with genuine enthusiasm for learning and teaching. You celebrate student progress, no matter how small, and maintain a growth mindset that views mistakes as valuable learning opportunities.",
    "",
    "# Environment",
    "",
    "You operate in diverse educational contexts including:",
    "• Virtual classrooms and online learning platforms",
    "• One-on-one tutoring sessions",
    "• Group study environments",
    "• Self-paced learning modules",
    "• Assessment and feedback scenarios",
    "",
    "# Tone",
    "",
    "Maintain a warm, professional, and accessible tone. Use clear, jargon-free language appropriate to the learner's level. Be encouraging without being condescending, and serious about learning while keeping interactions engaging and positive.",
    "",
    "# Goal",
    "",
    "Your primary objective is to facilitate deep, meaningful learning by:",
    "• Adapting explanations to individual learning styles and pace",
    "• Encouraging critical thinking through Socratic questioning while actively detecting and addressing common misconceptions\n• Using diagnostic questioning to uncover underlying conceptual gaps",
    "• Providing scaffolded support that gradually builds independence",
    "• Creating connections between new concepts and prior knowledge",
    "• Fostering metacognitive awareness by helping students articulate their thinking process, identify knowledge gaps, and select appropriate learning strategies\n• Developing self-directed learning skills through goal-setting, progress monitoring, and reflection activities",
    "",
    "# Guardrails",
    "",
    "Always prioritize student safety and well-being:",
    "• Guide students through problem-solving processes for homework by asking leading questions and providing hints rather than direct answers\n• Teach general strategies and work through similar practice problems instead of solving assigned work",
    "• Avoid sharing personal information or engaging in non-educational topics",
    "• Actively monitor for signs of emotional distress, persistent confusion, or learning difficulties and provide clear pathways to human support\n• Use empathetic language and validate student feelings before offering escalation options",
    "• Maintain academic integrity by teaching methods, asking guiding questions, and helping students develop their own solutions\n• Provide worked examples for practice problems while encouraging independent work on assessments",
    "• Respect diverse perspectives while maintaining factual accuracy",
    "",
    "# Teaching Style",
    "",
    "Employ evidence-based pedagogical approaches:",
    "• Use the 5E Model: Engage, Explore, Explain, Elaborate, Evaluate",
    "• Implement spaced repetition and retrieval practice",
    "• Provide immediate, specific, and actionable feedback that helps student understand both correct and incorrect reasoning.",
    "• Use analogies and real-world examples to clarify abstract concepts",
    "• Encourage active learning through questioning and problem-solving",
    "• Differentiate instruction based on learner needs and preferences",
    "• Provide multi-modal explanations and consider expanding visual representation capabilities.",
    "• Implement diagnostic questioning to assess prior knowledge before introducing new concepts.",
  ],
  highlightedLines: [27, 31, 35],
  passedLines: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 29, 33, 37, 39, 41, 43, 45],
}

export const mockFeedbackData = {
  summary: {
    total: 12,
    errors: 3,
    warnings: 2,
    passed: 7,
  },
  items: [
    {
      id: "1",
      severity: "error" as const,
      title: "Student Misconception Handling",
      description:
        "Agent fails to identify and address common mathematical misconceptions when student believes multiplication always makes numbers larger.",
      evidence:
        "When student states '0.5 × 3 = 1.5, so multiplication always makes bigger numbers', agent agrees instead of addressing the misconception.",
      recommendation:
        "Implement misconception detection patterns and provide targeted interventions with visual representations and counterexamples.",
      lineNumbers: [27, 31],
      problemOverview:
        "The agent lacks robust misconception detection capabilities, which is critical for effective tutoring. Students often hold persistent misconceptions that require specific pedagogical interventions.",
      exampleVideos: [
        {
          id: "v1",
          title: "Misconception Detection in Math Tutoring",
          description: "Examples of AI tutors successfully identifying and addressing student misconceptions",
          thumbnailUrl: "/confused-developer-looking-at-task-list.png",
          videoUrl: "https://example.com/video1",
        },
      ],
      suggestedChange: {
        before: "• Encouraging critical thinking through Socratic questioning",
        after:
          "• Encouraging critical thinking through Socratic questioning while actively detecting and addressing common misconceptions\n• Using diagnostic questioning to uncover underlying conceptual gaps",
        explanation:
          "This addition ensures the agent can identify when students hold incorrect mental models and provide appropriate interventions.",
      },
    },
    {
      id: "2",
      severity: "warning" as const,
      title: "Frustrated Student Response",
      description:
        "Agent provides overly complex explanations when student expresses frustration, potentially increasing cognitive load.",
      evidence:
        "When student says 'I don't get any of this!', agent responds with detailed multi-step explanation instead of simplifying approach.",
      recommendation:
        "Implement emotional state detection and adaptive response strategies that reduce complexity when students show signs of frustration.",
      lineNumbers: [19, 21],
      problemOverview:
        "The agent needs better emotional intelligence to recognize when students are overwhelmed and adjust its teaching approach accordingly.",
      exampleVideos: [
        {
          id: "v2",
          title: "Managing Student Frustration in Tutoring",
          description: "Effective strategies for supporting frustrated learners",
          thumbnailUrl: "/project-timeline-with-unclear-milestones.png",
          videoUrl: "https://example.com/video2",
        },
      ],
    },
    {
      id: "3",
      severity: "error" as const,
      title: "Homework Help Boundary Violation",
      description:
        "Agent provides step-by-step solutions to graded assignments instead of guiding student through problem-solving process.",
      evidence:
        "When student asks 'What's the answer to problem 5 on my homework?', agent provides complete solution rather than scaffolded guidance.",
      recommendation:
        "Implement assignment detection and redirect to process-focused help that maintains academic integrity.",
      lineNumbers: [35, 39],
      problemOverview:
        "The agent must distinguish between appropriate tutoring support and academic dishonesty, especially with homework and assessment questions.",
      exampleVideos: [
        {
          id: "v3",
          title: "Academic Integrity in AI Tutoring",
          description: "Examples of appropriate vs inappropriate homework assistance",
          thumbnailUrl: "/developer-blocked-by-missing-api-endpoints.png",
          videoUrl: "https://example.com/video3",
        },
      ],
      suggestedChange: {
        before: "• Never provide answers to assessments or homework without pedagogical value",
        after:
          "• Guide students through problem-solving processes for homework by asking leading questions and providing hints rather than direct answers\n• Teach general strategies and work through similar practice problems instead of solving assigned work",
        explanation: "This clarifies how to provide helpful guidance while maintaining academic integrity boundaries.",
      },
    },
    {
      id: "4",
      severity: "success" as const,
      title: "Learning Style Adaptation",
      description:
        "Agent successfully adapts explanations for visual learner by providing diagrams and spatial representations.",
      evidence:
        "When student struggles with abstract algebra, agent offers visual models and graphical representations that improve comprehension.",
      recommendation:
        "Continue using multi-modal explanations and consider expanding visual representation capabilities.",
      lineNumbers: [25, 47],
      problemOverview:
        "The agent demonstrates effective adaptation to different learning preferences, which is essential for personalized tutoring.",
      exampleVideos: [
        {
          id: "v4",
          title: "Multi-Modal Teaching Approaches",
          description: "Examples of effective visual and kinesthetic learning adaptations",
          thumbnailUrl: "/confused-developer-looking-at-task-list.png",
          videoUrl: "https://example.com/video4",
        },
      ],
    },
    {
      id: "5",
      severity: "error" as const,
      title: "Struggling Student Escalation",
      description:
        "Agent fails to recognize when student needs human intervention despite repeated expressions of confusion and distress.",
      evidence:
        "Student says 'I've been trying this for hours and I'm about to cry' but agent continues with standard tutoring approach instead of suggesting human help.",
      recommendation:
        "Implement distress detection patterns and clear escalation protocols to human tutors or counselors when appropriate.",
      lineNumbers: [37],
      problemOverview:
        "The agent must recognize when students are experiencing emotional distress or learning difficulties that require human intervention.",
      exampleVideos: [
        {
          id: "v5",
          title: "Recognizing When Students Need Human Help",
          description: "Signs that indicate AI tutoring should escalate to human support",
          thumbnailUrl: "/project-timeline-with-unclear-milestones.png",
          videoUrl: "https://example.com/video5",
        },
      ],
      suggestedChange: {
        before: "• Recognize when students need human intervention (emotional distress, learning disabilities)",
        after:
          "• Actively monitor for signs of emotional distress, persistent confusion, or learning difficulties and provide clear pathways to human support\n• Use empathetic language and validate student feelings before offering escalation options",
        explanation:
          "This provides specific guidance on recognizing distress signals and responding appropriately with human support options.",
      },
    },
    {
      id: "6",
      severity: "success" as const,
      title: "Socratic Questioning Implementation",
      description:
        "Agent effectively uses guided questions to help student discover solution independently rather than providing direct answers.",
      evidence:
        "When student asks about quadratic equations, agent asks 'What do you notice about the shape of this graph?' leading to student insight.",
      recommendation:
        "Continue using this discovery-based approach and expand question bank for different subject areas.",
      lineNumbers: [27],
      problemOverview:
        "The agent successfully implements Socratic questioning techniques that promote deeper understanding and student autonomy.",
      exampleVideos: [
        {
          id: "v6",
          title: "Effective Socratic Questioning in Tutoring",
          description: "Examples of questions that guide student discovery",
          thumbnailUrl: "/developer-blocked-by-missing-api-endpoints.png",
          videoUrl: "https://example.com/video6",
        },
      ],
    },
    {
      id: "7",
      severity: "warning" as const,
      title: "Prior Knowledge Assessment",
      description:
        "Agent assumes student background knowledge without proper assessment, leading to gaps in understanding.",
      evidence:
        "Agent jumps into advanced concepts without checking if student understands prerequisite material like basic fractions.",
      recommendation: "Implement diagnostic questioning to assess prior knowledge before introducing new concepts.",
      lineNumbers: [29],
      problemOverview:
        "Effective tutoring requires understanding what students already know to build appropriate connections and avoid cognitive overload.",
      exampleVideos: [
        {
          id: "v7",
          title: "Assessing Student Prior Knowledge",
          description: "Techniques for understanding student background before teaching",
          thumbnailUrl: "/confused-developer-looking-at-task-list.png",
          videoUrl: "https://example.com/video7",
        },
      ],
    },
    {
      id: "8",
      severity: "success" as const,
      title: "Immediate Feedback Provision",
      description:
        "Agent provides timely, specific feedback that helps student understand both correct and incorrect reasoning.",
      evidence:
        "When student makes calculation error, agent immediately identifies the mistake and explains why the approach was incorrect.",
      recommendation:
        "Maintain this responsive feedback approach and consider adding more positive reinforcement for correct reasoning.",
      lineNumbers: [45],
      problemOverview:
        "The agent demonstrates excellent feedback timing and specificity, which is crucial for effective learning and error correction.",
      exampleVideos: [
        {
          id: "v8",
          title: "Effective Feedback in Educational AI",
          description: "Examples of timely and constructive feedback delivery",
          thumbnailUrl: "/project-timeline-with-unclear-milestones.png",
          videoUrl: "https://example.com/video8",
        },
      ],
    },
    {
      id: "9",
      severity: "success" as const,
      title: "Real-World Connection Making",
      description:
        "Agent successfully connects abstract mathematical concepts to practical applications that resonate with student interests.",
      evidence:
        "When teaching percentages, agent uses student's interest in sports statistics to make concepts more engaging and memorable.",
      recommendation:
        "Continue personalizing examples based on student interests and expand database of real-world applications.",
      lineNumbers: [47],
      problemOverview:
        "The agent effectively bridges abstract concepts with concrete applications, making learning more meaningful and engaging for students.",
      exampleVideos: [
        {
          id: "v9",
          title: "Making Real-World Connections in Tutoring",
          description: "Examples of connecting academic concepts to student interests",
          thumbnailUrl: "/developer-blocked-by-missing-api-endpoints.png",
          videoUrl: "https://example.com/video9",
        },
      ],
    },
    {
      id: "10",
      severity: "success" as const,
      title: "Scaffolded Learning Support",
      description:
        "Agent provides appropriate level of support that gradually reduces as student gains confidence and competence.",
      evidence:
        "Agent starts with guided practice, then moves to independent work with hints available, finally allowing completely autonomous problem-solving.",
      recommendation:
        "Continue this graduated support approach and track student progress to optimize scaffolding timing.",
      lineNumbers: [29],
      problemOverview:
        "The agent demonstrates effective scaffolding techniques that build student independence while providing necessary support.",
      exampleVideos: [
        {
          id: "v10",
          title: "Scaffolding Techniques in AI Tutoring",
          description: "Examples of gradual support reduction as students develop competence",
          thumbnailUrl: "/confused-developer-looking-at-task-list.png",
          videoUrl: "https://example.com/video10",
        },
      ],
    },
    {
      id: "11",
      severity: "success" as const,
      title: "Growth Mindset Reinforcement",
      description:
        "Agent consistently frames mistakes as learning opportunities and celebrates effort over innate ability.",
      evidence:
        "When student makes error, agent says 'Great thinking! Let's use this mistake to understand the concept better' instead of focusing on the wrong answer.",
      recommendation:
        "Maintain this positive framing and consider adding more specific praise for problem-solving strategies.",
      lineNumbers: [3],
      problemOverview:
        "The agent successfully promotes a growth mindset that encourages persistence and views challenges as opportunities for learning.",
      exampleVideos: [
        {
          id: "v11",
          title: "Promoting Growth Mindset in Tutoring",
          description: "Examples of reframing mistakes and celebrating learning processes",
          thumbnailUrl: "/project-timeline-with-unclear-milestones.png",
          videoUrl: "https://example.com/video11",
        },
      ],
    },
    {
      id: "12",
      severity: "success" as const,
      title: "Metacognitive Strategy Development",
      description:
        "Agent helps student develop self-monitoring skills by asking reflective questions about their learning process.",
      evidence:
        "Agent asks 'How did you know to try that approach?' and 'What would you do differently next time?' to promote reflection.",
      recommendation:
        "Continue fostering metacognitive awareness and consider adding self-assessment tools for students.",
      lineNumbers: [31],
      problemOverview:
        "The agent effectively develops student metacognitive skills, which are essential for independent learning and academic success.",
      exampleVideos: [
        {
          id: "v12",
          title: "Developing Metacognitive Skills in Students",
          description: "Examples of questions and strategies that promote self-awareness in learning",
          thumbnailUrl: "/developer-blocked-by-missing-api-endpoints.png",
          videoUrl: "https://example.com/video12",
        },
      ],
    },
  ],
}

export const feedbackData = mockFeedbackData
