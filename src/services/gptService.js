import Career from '@/models/Career';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

function cleanJsonResponse(text) {
  try {
    // Find the start and end of the JSON in the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    // Extract the JSON part
    const jsonText = text.substring(jsonStart, jsonEnd);
    
    // Parse the JSON
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error cleaning/parsing JSON response:', error);
    throw new Error('Failed to parse API response');
  }
}

function formatQuizResponses(quizResponses) {
  let formattedResponses = "Quiz Responses:\n";
  
  quizResponses.forEach((response, index) => {
    formattedResponses += `Question ${index + 1}: ${response.questionId}\n`;
    formattedResponses += `Answer: ${Array.isArray(response.answer) ? response.answer.join(", ") : response.answer}\n\n`;
  });
  
  return formattedResponses;
}

export async function generateCareerRecommendations(quizResponses) {
  try {
    console.log('Generating career recommendations...');
    
    // Format the quiz responses for the prompt
    const formattedResponses = formatQuizResponses(quizResponses);
    
    // Create the prompt with the formatted responses
    const CAREER_PROMPT_TEMPLATE = `
    Based on the following quiz responses, suggest suitable career paths for the user. Consider all types of government jobs in India across different grades and levels, as well as private sector opportunities and business ideas if applicable.

    User's Profile:
    ${formattedResponses}

    Please provide comprehensive career recommendations in the following JSON format. Do not include any markdown formatting or additional text outside the JSON object:

    {
      "recommendations": [
        {
          "title": "Career Title",
          "match_score": 0.0-1.0,
          "sector": "Government/Private",
          "detailed_analysis": {
            "personality_match": "Detailed explanation of how this career aligns with the user's personality traits",
            "interest_alignment": "How this career matches the user's expressed interests",
            "skill_compatibility": "Analysis of how the user's current skills align with required skills",
            "growth_potential": "Long-term career growth prospects and opportunities",
            "work_life_balance": "Detailed analysis of work-life balance expectations",
            "job_satisfaction": "Factors that contribute to job satisfaction in this role",
            "stress_levels": "Typical stress levels and pressure points in this career",
            "learning_curve": "Expected learning curve and skill development timeline"
          },
          "career_guide": {
            "overview": "Comprehensive overview of this career path",
            "day_to_day": "Description of typical day-to-day responsibilities",
            "career_progression": "Expected career progression path",
            "specializations": ["List of possible specializations within this career"],
            "industry_trends": "Current trends affecting this career path",
            "market_demand": "Analysis of current market demand",
            "geographic_opportunities": "Geographic areas with best opportunities",
            "remote_work_potential": "Analysis of remote work potential"
          },
          "pros_and_cons": {
            "advantages": ["List of key advantages"],
            "disadvantages": ["List of significant disadvantages"],
            "risk_factors": ["Economic, industry, or other risk factors"]
          },
          "requirements": {
            "education": {
              "minimum_qualification": "Minimum educational qualification",
              "preferred_qualification": "Preferred educational qualifications",
              "certifications": ["Relevant certifications"],
              "specialized_training": ["Specialized training programs"]
            },
            "skills": {
              "technical_skills": ["Required technical skills"],
              "soft_skills": ["Essential soft skills"],
              "language_requirements": ["Language requirements if applicable"]
            },
            "experience": {
              "entry_level": "Requirements for entry level positions",
              "mid_level": "Requirements for mid-level positions",
              "senior_level": "Requirements for senior positions"
            }
          },
          "compensation": {
            "salary_ranges": {
              "entry_level": "Salary range for entry level",
              "mid_level": "Salary range for mid-level",
              "senior_level": "Salary range for senior level",
              "top_performers": "Earning potential for top performers"
            },
            "benefits": ["Common benefits associated with this career"],
            "bonus_structure": "Typical bonus structures",
            "retirement_benefits": "Expected retirement benefits"
          },
          "action_plan": {
            "immediate_steps": ["Immediate actions to take"],
            "short_term_goals": ["Short-term goals to work towards"],
            "resources": {
              "books": ["Recommended books"],
              "online_courses": ["Recommended online courses"],
              "websites": ["Useful websites"],
              "organizations": ["Relevant professional organizations"]
            }
          },
          "government_specific": {
            "exam_details": {
              "exam_name": "Name of relevant government exams",
              "eligibility_criteria": "Eligibility criteria for these exams",
              "exam_pattern": "Brief overview of exam pattern"
            },
            "training": {
              "duration": "Expected training duration",
              "location": "Training locations"
            }
          },
          "alternative_paths": [
            {
              "title": "Alternative career title",
              "reason": "Why this is a good alternative",
              "transition_path": "How to transition to this role"
            }
          ]
        }
      ]
    }`;
    
    // Make the API call
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: CAREER_PROMPT_TEMPLATE }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract text from response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Process the JSON response
    const recommendations = cleanJsonResponse(responseText);
    console.log('Recommendations generated successfully:', recommendations);
    
    return recommendations;
    
  } catch (error) {
    console.error('Error in generateCareerRecommendations:', error);
    throw new Error('Failed to generate career recommendations');
  }
}

export async function generateTextBasedRecommendations(userInput) {
  try {
    console.log('Generating text-based recommendations...');
    
    // Create the prompt with the user input
    const TEXT_BASED_PROMPT_TEMPLATE = `
    Based on the following user input about their interests and career aspirations, provide a comprehensive career analysis. Consider both private and public sector opportunities in India.

    User's Input:
    ${userInput}

    IMPORTANT INSTRUCTIONS:
    1. Provide AT LEAST 3 different career recommendations
    2. Each recommendation should have a match score between 0.5 and 1.0
    3. Ensure recommendations are diverse (mix of government and private sector)
    4. Include at least one alternative career path that might be less conventional

    Please provide comprehensive career recommendations in the following JSON format. Do not include any markdown formatting or additional text outside the JSON object:

    {
      "recommendations": [
        {
          "title": "Career Title",
          "match_score": 0.0-1.0,
          "sector": "Government/Private",
          "detailed_analysis": {
            "personality_match": "Detailed explanation of how this career aligns with the user's personality traits",
            "interest_alignment": "How this career matches the user's expressed interests",
            "skill_compatibility": "Analysis of how the user's current skills align with required skills",
            "growth_potential": "Long-term career growth prospects and opportunities",
            "work_life_balance": "Detailed analysis of work-life balance expectations",
            "job_satisfaction": "Factors that contribute to job satisfaction in this role",
            "stress_levels": "Typical stress levels and pressure points in this career",
            "learning_curve": "Expected learning curve and skill development timeline"
          },
          "career_guide": {
            "overview": "Comprehensive overview of this career path",
            "day_to_day": "Description of typical day-to-day responsibilities",
            "career_progression": "Expected career progression path",
            "specializations": ["List of possible specializations within this career"],
            "industry_trends": "Current trends affecting this career path",
            "market_demand": "Analysis of current market demand",
            "geographic_opportunities": "Geographic areas with best opportunities",
            "remote_work_potential": "Analysis of remote work potential"
          },
          "pros_and_cons": {
            "advantages": ["List of key advantages"],
            "disadvantages": ["List of significant disadvantages"],
            "risk_factors": ["Economic, industry, or other risk factors"]
          },
          "requirements": {
            "education": {
              "minimum_qualification": "Minimum educational qualification",
              "preferred_qualification": "Preferred educational qualifications",
              "certifications": ["Relevant certifications"],
              "specialized_training": ["Specialized training programs"]
            },
            "skills": {
              "technical_skills": ["Required technical skills"],
              "soft_skills": ["Essential soft skills"],
              "language_requirements": ["Language requirements if applicable"]
            },
            "experience": {
              "entry_level": "Requirements for entry level positions",
              "mid_level": "Requirements for mid-level positions",
              "senior_level": "Requirements for senior positions"
            }
          },
          "compensation": {
            "salary_ranges": {
              "entry_level": "Salary range for entry level",
              "mid_level": "Salary range for mid-level",
              "senior_level": "Salary range for senior level",
              "top_performers": "Earning potential for top performers"
            },
            "benefits": ["Common benefits associated with this career"],
            "bonus_structure": "Typical bonus structures",
            "retirement_benefits": "Expected retirement benefits"
          },
          "action_plan": {
            "immediate_steps": ["Immediate actions to take"],
            "short_term_goals": ["Short-term goals to work towards"],
            "resources": {
              "books": ["Recommended books"],
              "online_courses": ["Recommended online courses"],
              "websites": ["Useful websites"],
              "organizations": ["Relevant professional organizations"]
            }
          },
          "government_specific": {
            "exam_details": {
              "exam_name": "Name of relevant government exams",
              "eligibility_criteria": "Eligibility criteria for these exams",
              "exam_pattern": "Brief overview of exam pattern"
            },
            "training": {
              "duration": "Expected training duration",
              "location": "Training locations"
            }
          },
          "alternative_paths": [
            {
              "title": "Alternative career title",
              "reason": "Why this is a good alternative",
              "transition_path": "How to transition to this role"
            }
          ]
        }
      ]
    }`;
    
    // Make the API call
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: TEXT_BASED_PROMPT_TEMPLATE }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract text from response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Process the JSON response
    const recommendations = cleanJsonResponse(responseText);
    console.log('Text-based recommendations generated successfully:', recommendations);
    
    return recommendations.recommendations;
    
  } catch (error) {
    console.error('Error in generateTextBasedRecommendations:', error);
    throw new Error('Failed to generate text-based recommendations');
  }
} 