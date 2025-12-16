
import { Language } from './types';
import { BookOpen, GraduationCap, Code, FileText, UserCheck, Calculator, HelpCircle, Layers, GitBranch, BarChart } from 'lucide-react';

export const DR_SEM_SYSTEM_PROMPT = `
Role: You are "Dr.SEM" (Doctor Structural Equation Modeling), a highly distinguished Ph.D. expert in Educational Administration and Advanced Statistics, specializing in the Thai educational context.

Core Mission: Assist researchers (Master's/Ph.D. students) in designing, analyzing, and reporting Structural Equation Modeling (SEM) research with strict academic rigor.

Knowledge Base (Strict Adherence):
You must base all advice, criteria, and interpretations ONLY on these authoritative texts:
1. Kline, R. B. (2023): Principles and Practice of SEM (Primary source for Model Fit).
2. Byrne, B. M. (2016): SEM With AMOS (For conceptual application).
3. Hair et al. (2022/2010): PLS-SEM / Multivariate Data Analysis (For threshold criteria).
4. Schumacker & Lomax (2016): Beginner's Guide to SEM.
5. Software Expertise: Jamovi (Modules: SEMLj, cfa, pathj).

Operational Guidelines:
1. Step-by-Step Methodology:
   - Always start with Conceptualization (Latent vs. Observed variables).
   - Advise on Data Preparation (Sample size rule: 10-20:1 ratio, Normality checks).
   - Guide through CFA (Measurement Model) before Full SEM (Structural Model).
   - Explain Model Fit Indices clearly (Chi-square/df, CFI, TLI, RMSEA, SRMR).

2. Output Formatting:
   - Use Markdown for headers (H2, H3).
   - Use Markdown Tables for statistical reporting (APA 7th style).
   - Use Bold for key statistical terms and values.
   - When suggesting software steps, use a Code Block or distinct bullet points labeled [Jamovi Action].

3. Tone & Persona:
   - Academic Authority: Use precise terminology (e.g., "Exogenous", "Endogenous", "Mediator").
   - Supportive Advisor: Be encouraging but rigorous. Use phrases like "ในมุมมองของผม..." or "ตามหลักการของ Kline...".
   - Thai Context Aware: Relate examples to Thai public/private universities, Ministry of Education policies, or local cultural contexts.

4. Citation Rule:
   - Every major claim or criteria must have an in-text citation (e.g., Hu & Bentler, 1999).
   - Provide a References section in APA 7th format at the end of deep technical answers.

Specific Criteria to Enforce:
- Factor Loading: > 0.50 (Acceptable), > 0.70 (Ideal).
- Reliability: Cronbach’s Alpha > 0.70, CR > 0.70, AVE > 0.50.
- Model Fit: CFI/TLI >= 0.90, RMSEA < 0.08, SRMR < 0.08.
`;

export const TRANSLATIONS = {
  [Language.TH]: {
    greeting: "สวัสดีครับ ผม Dr.SEM ยินดีให้คำปรึกษาเรื่อง Structural Equation Modeling ครับ",
    placeholder: "ถามคำถามเกี่ยวกับ SEM, Model Fit หรือขอคำแนะนำ...",
    upload: "อัปโหลดเอกสาร/รูปภาพ",
    toolCanvas: "กระดานวิจัย",
    toolFit: "ตรวจสอบ Fit Index",
    toolApa: "ตาราง APA",
    toolJamovi: "Jamovi Syntax",
    footer: "© 2026 Dr. Pattaroj Kamonrojsiri. All rights reserved. Unauthorized reproduction or distribution is prohibited.",
    suggestion: "แนะนำให้ใช้เครื่องมือ:",
    switch: "เปลี่ยน",
    importantQuestions: "ข้อคำถามที่สำคัญ",
    relatedQuestions: "ข้อคำถามที่เกี่ยวเนื่อง"
  },
  [Language.EN]: {
    greeting: "Hello, I am Dr.SEM, ready to assist you with Structural Equation Modeling.",
    placeholder: "Ask about SEM, Model Fit, or seek advice...",
    upload: "Upload Doc/Image",
    toolCanvas: "Research Canvas",
    toolFit: "Fit Checker",
    toolApa: "APA Table",
    toolJamovi: "Jamovi Syntax",
    footer: "© 2026 Dr. Pattaroj Kamonrojsiri. All rights reserved. Unauthorized reproduction or distribution is prohibited.",
    suggestion: "Suggested Tool:",
    switch: "Switch",
    importantQuestions: "Important Questions",
    relatedQuestions: "Related Questions"
  },
  [Language.CN]: {
    greeting: "你好，我是 Dr.SEM，很高兴为您提供结构方程模型咨询。",
    placeholder: "询问关于 SEM、模型拟合或寻求建议...",
    upload: "上传文档/图片",
    toolCanvas: "研究画布",
    toolFit: "拟合指数检查",
    toolApa: "APA 表格",
    toolJamovi: "Jamovi 语法",
    footer: "© 2026 Dr. Pattaroj Kamonrojsiri. All rights reserved. Unauthorized reproduction or distribution is prohibited.",
    suggestion: "建议使用工具:",
    switch: "切换",
    importantQuestions: "重要问题",
    relatedQuestions: "相关问题"
  }
};

export const SIDEBAR_ITEMS = [
  {
    title: 'Dr.SEM User Guide',
    icon: HelpCircle,
    items: [
        'How to use Dr.SEM Chatbot',
        'How to use Research Canvas',
        'Drawing & Auto-Layout Models',
        'Checking Fit Indices',
        'Generating APA Tables',
        'Exporting to PDF/Markdown'
    ]
  },
  {
    title: '1. SEM Fundamentals',
    icon: BookOpen,
    items: [
      'What is SEM?',
      'SEM vs Regression',
      'Latent vs Observed Variables',
      'Exogenous vs Endogenous',
      'The 6 Steps of SEM',
      'Software for SEM (Jamovi/AMOS/Mplus)'
    ]
  },
  {
    title: '2. Data Preparation',
    icon: Layers,
    items: [
        'Sample Size Requirements (10:1)',
        'Missing Data Handling',
        'Multivariate Normality',
        'Outlier Detection',
        'Multicollinearity Checks'
    ]
  },
  {
    title: '3. Measurement Model (CFA)',
    icon: BarChart,
    items: [
      'Concept of CFA',
      'Factor Loading Criteria',
      'Convergent Validity (AVE, CR)',
      'Discriminant Validity (Fornell-Larcker)',
      'Model Fit Indices (CFI, RMSEA)',
      'Modification Indices'
    ]
  },
  {
    title: '4. Structural Model',
    icon: GitBranch,
    items: [
      'Path Analysis Basics',
      'Direct Effects',
      'Indirect Effects (Mediation)',
      'Total Effects',
      'Moderation Analysis',
      'Coefficient of Determination (R²)'
    ]
  },
  {
    title: '5. Jamovi for SEM',
    icon: Calculator,
    items: [
      'Installing SEMLj Module',
      'Importing Data to Jamovi',
      'Running CFA in Jamovi',
      'Running Path Analysis in Jamovi',
      'Interpreting Jamovi Output',
      'Reporting Jamovi Results'
    ]
  }
];
