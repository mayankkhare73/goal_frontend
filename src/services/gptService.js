// import Career from '@/models/Career';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Extract recommendations from Gemini response
function extractRecommendationsFromGeminiResponse(responseJsonString) {
  console.log('extractRecommendationsFromGeminiResponse', responseJsonString);
  try {
    // const outer = JSON.parse(responseJsonString);
    const partText = responseJsonString.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Remove code block syntax like ```json and ```
    const innerJsonString = partText.replace(/```json|```/g, '').trim();
    console.log('innerJsonString', innerJsonString);
    const parsedInner = JSON.parse(innerJsonString);

    return parsedInner || [];

  } catch (err) {
    console.error("❌ Error extracting recommendations:", err.message);
    return [];
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
    
    // Create the prompt with the formatted responses - updating to request 3 recommendations
    const CAREER_PROMPT_TEMPLATE = `
    Based on the following quiz responses, suggest broader professional fields and career paths (NOT specific jobs) for the user. Consider different professional domains such as scientific research, creative arts, public service, business leadership, healthcare, technology innovation, education, and entrepreneurship.

    User's Profile:
    ${formattedResponses}

    IMPORTANT INSTRUCTIONS (READ CAREFULLY):
    1. PRIORITIZE COMPLETENESS over quantity - it's better to return ONE fully detailed recommendation than multiple incomplete ones
    2. Provide 1-2 COMPLETE career recommendations (do not attempt 3 if it would make your response exceed limits)
    3. Recommendations MUST be diverse in nature (entirely different domains, different professional fields)
    4. Focus on broad professional fields that encompass multiple related roles, NOT specific job titles
    5. Each recommendation must be complete with all fields filled in
    6. DO NOT cut off any parts of recommendations
    7. Make sure each recommendation has a unique title that represents a professional field, not a specific job
    8. Each recommendation must have a match score between 0.65 and 1.0
    9. The recommendations should be ordered from best match to lowest match
    10. Be creative and insightful in matching career paths to the person's interests and aptitudes
    11. CRITICALLY IMPORTANT: Deliberately choose career domains that use entirely different thinking styles (e.g., analytical vs. creative vs. interpersonal)
    12. Ensure all the recommendations span different sectors (e.g., one scientific/technical, one creative/artistic, one service/people-oriented)
    13. Consider unconventional career domains that might not be immediately obvious from the responses

    Please provide comprehensive professional field recommendations in the following JSON format. Do not include any markdown formatting or additional text outside the JSON object:

    {
      "recommendations": [
        {
          "title": "Career Title 1",
          "match_score": 0.65-1.0,
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
            "overview": "Comprehensive overview of this professional field",
            "day_to_day": "Description of typical responsibilities across this professional domain",
            "career_progression": "Expected career progression paths within this field",
            "specializations": ["List of possible specializations within this professional domain"],
            "industry_trends": "Current trends affecting this professional field",
            "market_demand": "Analysis of current market demand for professionals in this field",
            "geographic_opportunities": "Geographic areas with best opportunities for this profession",
            "remote_work_potential": "Analysis of remote work potential within this professional field"
          },
          "pros_and_cons": {
            "advantages": ["List of key advantages of pursuing this professional field"],
            "disadvantages": ["List of significant disadvantages of this career path"],
            "risk_factors": ["Economic, industry, or other risk factors in this professional domain"]
          },
          "requirements": {
            "education": {
              "minimum_qualification": "Minimum educational qualification needed to enter this field",
              "preferred_qualification": "Preferred educational qualifications for advancement in this field",
              "certifications": ["Relevant certifications for this professional domain"],
              "specialized_training": ["Specialized training programs beneficial for this field"]
            },
            "skills": {
              "technical_skills": ["Required technical skills across this professional domain"],
              "soft_skills": ["Essential soft skills for success in this field"],
              "language_requirements": ["Language requirements if applicable to this field"]
            },
            "experience": {
              "entry_level": "Requirements to enter this professional field",
              "mid_level": "Requirements for mid-level positions in this domain",
              "senior_level": "Requirements for senior positions in this field"
            }
          },
          "compensation": {
            "salary_ranges": {
              "entry_level": "Salary range for entry level in this field",
              "mid_level": "Salary range for mid-level professionals",
              "senior_level": "Salary range for senior professionals",
              "top_performers": "Earning potential for top performers in this field"
            },
            "benefits": ["Common benefits associated with this professional domain"],
            "bonus_structure": "Typical bonus structures in this field",
            "retirement_benefits": "Expected retirement benefits in this profession"
          },
          "action_plan": {
            "immediate_steps": ["Immediate actions to take to enter this field"],
            "short_term_goals": ["Short-term goals to work towards in this profession"],
            "resources": {
              "books": ["Recommended books on this professional field"],
              "online_courses": ["Recommended online courses for this field"],
              "websites": ["Useful websites for this profession"],
              "organizations": ["Relevant professional organizations in this domain"]
            }
          },
          "government_specific": {
            "exam_details": {
              "exam_name": "Name of relevant government exams for this field",
              "eligibility_criteria": "Eligibility criteria for these exams",
              "exam_pattern": "Brief overview of exam pattern"
            },
            "training": {
              "duration": "Expected training duration in government sector",
              "location": "Training locations"
            }
          },
          "alternative_paths": [
            {
              "title": "Alternative professional domain",
              "reason": "Why this is a good alternative field",
              "transition_path": "How to transition to this alternative domain"
            }
          ]
        }
      ]
    }`;
    
    console.log('Making API call to Gemini...');
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
          temperature: 1.0,
          topK: 60,
          topP: 0.98,
          maxOutputTokens: 8192
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract text from response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected API response structure:', JSON.stringify(data));
      throw new Error('Invalid API response structure');
    }
    
    // const responseText = data.candidates[0].content.parts[0].text;
    // console.log('Received response text:', responseText.substring(0, 200) + '...');
    
    // Process the JSON response
    const parsedData = extractRecommendationsFromGeminiResponse(data);
    console.log('parsedData', parsedData);
    
    if (!parsedData || !parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      console.error('Failed to parse recommendations from response:', parsedData);
      throw new Error('Invalid recommendations format in API response');
    }
    console.log('parsedData', parsedData.recommendations.length);
    
    if (parsedData.recommendations.length === 0) {
      console.error('No recommendations returned from API');
      throw new Error('No recommendations were generated');
    }

    // Update this section to ensure only 3 recommendations
    // Don't force exactly 3 recommendations - prioritize quality over quantity
    if (parsedData.recommendations.length > 0) {
      console.log(`Received ${parsedData.recommendations.length} recommendation(s) from API`);
      
      // Validate that the first recommendation has the required fields
      const firstRec = parsedData.recommendations[0];
      if (!firstRec.title || !firstRec.sector || !firstRec.detailed_analysis) {
        console.error('First recommendation is incomplete');
        throw new Error('Received incomplete recommendation data');
      }
      
      // Ensure all recommendations have at least 65% match score
      parsedData.recommendations = parsedData.recommendations.map(rec => {
        if (typeof rec.match_score !== 'number' || rec.match_score < 0.65) {
          rec.match_score = 0.65;
        }
        return rec;
      });
      
      console.log('Text-based recommendations generated successfully:', 
        `Generated ${parsedData.recommendations.length} recommendation(s)`);
      
      return parsedData;
    } else {
      console.error('No recommendations returned from API');
      throw new Error('No recommendations were generated');
    }
    
  } catch (error) {
    console.error('Error in generateCareerRecommendations:', error);
    throw new Error('Failed to generate career recommendations: ' + error.message);
  }
}

export async function generateTextBasedRecommendations(userInput) {
  try {
    console.log('Generating text-based recommendations...');
    
    // Create the prompt with the user input
    // Create the prompt with the user input
    const TEXT_BASED_PROMPT_TEMPLATE = `
    Based on the following user input about their interests and career aspirations, provide a comprehensive career analysis. Consider both private and public sector opportunities in India.

    User's Input:
    ${userInput}

    IMPORTANT INSTRUCTIONS (READ CAREFULLY):
    1. PRIORITIZE COMPLETENESS over quantity - it's better to return ONE fully detailed recommendation than multiple incomplete ones
    2. Provide 1-2 COMPLETE career recommendations (do not attempt 3 if it would make your response exceed limits)
    3. Each recommendation must have a match score between 0.65 and 1.0
    4. Recommendations should represent a mix of sectors if possible (government and private)
    5. Each recommendation MUST be complete with ALL fields filled in
    6. DO NOT cut off any parts of recommendations
    7. Make sure each recommendation has a unique title
    8. The recommendations should be ordered from best match to lowest match

    Please provide career recommendations in the following JSON format. Do not include any markdown formatting or additional text outside the JSON object:

    {
      "recommendations": [
        {
          "title": "Career Title 1",
          "match_score": 0.65-1.0,
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
            "overview": "Comprehensive overview of this professional field",
            "day_to_day": "Description of typical responsibilities across this professional domain",
            "career_progression": "Expected career progression paths within this field",
            "specializations": ["List of possible specializations within this professional domain"],
            "industry_trends": "Current trends affecting this professional field",
            "market_demand": "Analysis of current market demand for professionals in this field",
            "geographic_opportunities": "Geographic areas with best opportunities for this profession",
            "remote_work_potential": "Analysis of remote work potential within this professional field"
          },
          "pros_and_cons": {
            "advantages": ["List of key advantages of pursuing this professional field"],
            "disadvantages": ["List of significant disadvantages of this career path"],
            "risk_factors": ["Economic, industry, or other risk factors in this professional domain"]
          },
          "requirements": {
            "education": {
              "minimum_qualification": "Minimum educational qualification needed to enter this field",
              "preferred_qualification": "Preferred educational qualifications for advancement in this field",
              "certifications": ["Relevant certifications for this professional domain"],
              "specialized_training": ["Specialized training programs beneficial for this field"]
            },
            "skills": {
              "technical_skills": ["Required technical skills across this professional domain"],
              "soft_skills": ["Essential soft skills for success in this field"],
              "language_requirements": ["Language requirements if applicable to this field"]
            },
            "experience": {
              "entry_level": "Requirements to enter this professional field",
              "mid_level": "Requirements for mid-level positions in this domain",
              "senior_level": "Requirements for senior positions in this field"
            }
          },
          "compensation": {
            "salary_ranges": {
              "entry_level": "Salary range for entry level in this field",
              "mid_level": "Salary range for mid-level professionals",
              "senior_level": "Salary range for senior professionals",
              "top_performers": "Earning potential for top performers in this field"
            },
            "benefits": ["Common benefits associated with this professional domain"],
            "bonus_structure": "Typical bonus structures in this field",
            "retirement_benefits": "Expected retirement benefits in this profession"
          },
          "action_plan": {
            "immediate_steps": ["Immediate actions to take to enter this field"],
            "short_term_goals": ["Short-term goals to work towards in this profession"],
            "resources": {
              "books": ["Recommended books on this professional field"],
              "online_courses": ["Recommended online courses for this field"],
              "websites": ["Useful websites for this profession"],
              "organizations": ["Relevant professional organizations in this domain"]
            }
          },
          "government_specific": {
            "exam_details": {
              "exam_name": "Name of relevant government exams for this field",
              "eligibility_criteria": "Eligibility criteria for these exams",
              "exam_pattern": "Brief overview of exam pattern"
            },
            "training": {
              "duration": "Expected training duration in government sector",
              "location": "Training locations"
            }
          },
          "alternative_paths": [
            {
              "title": "Alternative professional domain",
              "reason": "Why this is a good alternative field",
              "transition_path": "How to transition to this alternative domain"
            }
          ]
        }
      ]
    }`;
    
    console.log('Making API call to Gemini...');
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
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();

    // Extract text from response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected API response structure:', JSON.stringify(data));
      throw new Error('Invalid API response structure');
    }

    // console.log('data', data);
    const parsedData = extractRecommendationsFromGeminiResponse(data);


    if (!parsedData || !parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      console.error('Failed to parse recommendations from response:', parsedData);
      throw new Error('Invalid recommendations format in API response');
    }
    
    if (parsedData.recommendations.length === 0) {
      console.error('No recommendations returned from API');
      throw new Error('No recommendations were generated');
    }

    if (parsedData.recommendations. length > 0) {
      console.log(`Received ${parsedData.recommendations.length} recommendation(s) from API`);
      
      // Validate that the first recommendation has the required fields
      const firstRec = parsedData.recommendations[0];
      if (!firstRec.title || !firstRec.sector || !firstRec.detailed_analysis) {
        console.error('First recommendation is incomplete');
        throw new Error('Received incomplete recommendation data');
      }
      
      // Ensure all recommendations have at least 65% match score
      parsedData.recommendations = parsedData.recommendations.map(rec => {
        if (typeof rec.match_score !== 'number' || rec.match_score < 0.65) {
          rec.match_score = 0.65;
        }
        return rec;
      });
      
      console.log('Text-based recommendations generated successfully:', 
        `Generated ${parsedData.recommendations.length} recommendation(s)`);
      
      return parsedData.recommendations;
    } else {
      console.error('No recommendations returned from API');
      throw new Error('No recommendations were generated');
    }
    
  } catch (error) {
    console.error('Error in generateTextBasedRecommendations:', error);
    throw new Error('Failed to generate text-based recommendations: ' + error.message);
  }
} 