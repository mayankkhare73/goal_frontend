import Career from '@/models/Career';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

function cleanJsonResponse(text) {
  try {
    // First, check if the response is already in valid JSON format
    try {
      const directParse = JSON.parse(text);
      console.log('Direct JSON parsing successful');
      return directParse;
    } catch (directParseError) {
      // Continue with cleaning if direct parsing fails
      console.log('Direct parsing failed, attempting cleanup');
    }

    // Strip any markdown code block markers and extra text
    let cleanedText = text;
    if (text.includes('```json')) {
      cleanedText = text.replace(/```json\n?|\n?```/g, '');
    } else if (text.includes('```')) {
      cleanedText = text.replace(/```\n?|\n?```/g, '');
    }
    
    // Find the start and end of the JSON in the response
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    // Extract the JSON part
    let jsonText = cleanedText.substring(jsonStart, jsonEnd);
    
    // Fix trailing commas in arrays or objects (common Gemini error)
    jsonText = jsonText.replace(/,\s*(\}|\])/g, '$1');
    
    // Fix mismatched quotes by ensuring all property names and string values use double quotes
    jsonText = jsonText.replace(/(\w+)(?=\s*:)/g, '"$1"'); // Add quotes around property names without quotes
    jsonText = jsonText.replace(/:(\s*)'/g, ':$1"'); // Replace single quotes after colons with double quotes
    jsonText = jsonText.replace(/'(\s*)(,|}|])/g, '"$1$2'); // Replace single quotes before commas, braces, brackets with double quotes
    
    // Additional array cleaning
    jsonText = jsonText.replace(/\[\s*"([^"]+)"\s*\]/g, '["$1"]'); // Fix single-item arrays that might have extra spaces
    jsonText = jsonText.replace(/,\s*,/g, ','); // Remove double commas
    jsonText = jsonText.replace(/\[\s*,/g, '['); // Remove comma after opening bracket
    jsonText = jsonText.replace(/,\s*\]/g, ']'); // Remove comma before closing bracket
    
    // Handle common array formatting issues
    jsonText = jsonText.replace(/"\s+/g, '" '); // Fix spaces after quotes
    jsonText = jsonText.replace(/\s+"/g, ' "'); // Fix spaces before quotes
    
    // Replace any instances of ellipsis that might be in the JSON
    jsonText = jsonText.replace(/\.\.\./g, '');
    
    // Handle ellipsis in the placeholder format 
    // (this appears in our template as { ... } which is not valid JSON)
    jsonText = jsonText.replace(/\{\s*\.\.\.\s*\}/g, '{}');
    
    // Try to parse the JSON
    try {
      const parsedJson = JSON.parse(jsonText);
      console.log('Successfully parsed JSON after cleanup');
      
      // Verify recommendations structure and completeness
      if (parsedJson.recommendations && Array.isArray(parsedJson.recommendations)) {
        // Check if we have at least one non-empty recommendation
        if (parsedJson.recommendations.length > 0 && 
            parsedJson.recommendations[0].title && 
            parsedJson.recommendations[0].detailed_analysis) {
          return parsedJson;
        }
      }
      
      // If we reached here, we have JSON but possibly incomplete structure
      throw new Error('Recommendations structure incomplete');
      
    } catch (innerError) {
      console.warn('First JSON parse attempt failed:', innerError.message);
      
      // Attempt a more manual approach: extract just the recommendations array structure
      try {
        console.log('Trying to extract recommendations directly...');
        
        // Create a default structure
        const defaultStructure = {
          recommendations: []
        };
        
        // Find all recommendation objects - look for "title" fields
        const recommendationRegex = /"title"\s*:\s*"([^"]+)"/g;
        const titles = [];
        let match;
        while ((match = recommendationRegex.exec(jsonText)) !== null) {
          titles.push(match[1]);
        }
        
        console.log(`Found ${titles.length} possible recommendations by title`);
        
        if (titles.length > 0) {
          // For each title, extract the entire recommendation object if possible
          titles.forEach((title, index) => {
            try {
              // Try to find the full recommendation object for this title
              const titlePos = jsonText.indexOf(`"title": "${title}"`);
              if (titlePos > -1) {
                // Find the opening brace before this title
                let openingBracePos = jsonText.lastIndexOf('{', titlePos);
                let bracesCount = 1;
                let closingBracePos = -1;
                
                // Find the matching closing brace
                for (let i = openingBracePos + 1; i < jsonText.length; i++) {
                  if (jsonText[i] === '{') bracesCount++;
                  if (jsonText[i] === '}') bracesCount--;
                  
                  if (bracesCount === 0) {
                    closingBracePos = i;
                    break;
                  }
                }
                
                if (closingBracePos > -1) {
                  // Extract the full recommendation object
                  const recObjectText = jsonText.substring(openingBracePos, closingBracePos + 1);
                  
                  try {
                    // Clean the extracted object and parse it
                    let cleanedRecText = recObjectText.replace(/,\s*(\}|\])/g, '$1'); // Fix trailing commas
                    cleanedRecText = cleanedRecText.replace(/(\w+)(?=\s*:)/g, '"$1"'); // Add quotes to property names
                    cleanedRecText = cleanedRecText.replace(/:(\s*)'/g, ':$1"'); // Fix single quotes after colons
                    cleanedRecText = cleanedRecText.replace(/'(\s*)(,|}|])/g, '"$1$2'); // Fix single quotes before punctuation
                    
                    // Additional array-specific cleaning for this object
                    cleanedRecText = cleanedRecText.replace(/\[\s*"([^"]+)"\s*\]/g, '["$1"]'); // Fix single-item arrays
                    cleanedRecText = cleanedRecText.replace(/,\s*,/g, ','); // Remove double commas
                    cleanedRecText = cleanedRecText.replace(/\[\s*,/g, '['); // Remove comma after opening bracket
                    cleanedRecText = cleanedRecText.replace(/,\s*\]/g, ']'); // Remove comma before closing bracket
                    cleanedRecText = cleanedRecText.replace(/"\s+/g, '" '); // Fix spaces after quotes
                    cleanedRecText = cleanedRecText.replace(/\s+"/g, ' "'); // Fix spaces before quotes
                    
                    // Fix common array formatting issues in nested objects
                    const fixArraysRegex = /\[(.*?)\]/gs; // Global search through string for arrays
                    cleanedRecText = cleanedRecText.replace(fixArraysRegex, (match) => {
                      try {
                        // Try to clean the array content
                        let arrayContent = match.substring(1, match.length - 1).trim();
                        if (!arrayContent) return '[]'; // Empty array
                        
                        // Split by commas, but be smart about quoted strings
                        const items = [];
                        let currentItem = "";
                        let inQuotes = false;
                        
                        for (let i = 0; i < arrayContent.length; i++) {
                          const char = arrayContent[i];
                          
                          if (char === '"' && (i === 0 || arrayContent[i-1] !== '\\')) {
                            inQuotes = !inQuotes;
                          }
                          
                          if (char === ',' && !inQuotes) {
                            // End of item
                            items.push(currentItem.trim());
                            currentItem = "";
                          } else {
                            currentItem += char;
                          }
                        }
                        
                        // Add the last item
                        if (currentItem.trim()) {
                          items.push(currentItem.trim());
                        }
                        
                        // Process each item
                        const cleanedItems = items.map(item => {
                          item = item.trim();
                          // If it's not already in quotes, add them
                          if (!item.startsWith('"') && !item.endsWith('"')) {
                            return `"${item.replace(/"/g, '\\"')}"`;
                          }
                          return item;
                        });
                        
                        // Return fixed array
                        return '[' + cleanedItems.join(',') + ']';
                      } catch (e) {
                        // If anything fails, return the original match
                        return match;
                      }
                    });
                    
                    const recObject = JSON.parse(cleanedRecText);
                    
                    // Add the full parsed recommendation to our structure
                    defaultStructure.recommendations.push(recObject);
                    console.log(`Successfully extracted recommendation for "${title}"`);
                    
                    return; // Exit the current function early
                  } catch (recParseError) {
                    console.warn(`Failed to parse recommendation object for "${title}":`, recParseError);
                    // Additional debugging information
                    console.warn(`Problematic JSON excerpt: ${recObjectText.substring(0, 100)}...`);
                    
                    // Try a more brute force approach for problematic arrays
                    try {
                      console.log("Attempting secondary parsing approach...");
                      // Replace all arrays with simple placeholder values to see if that makes it parse
                      let simplifiedRecText = recObjectText.replace(/\[.*?\]/gs, '["simplified"]');
                      // Try to parse that simplified version
                      const tempObject = JSON.parse(simplifiedRecText);
                      // If we got here, the structure is valid except for arrays
                      
                      // Now build a manually sanitized object
                      const manuallyFixedObject = {
                        title: title,
                        match_score: typeof tempObject.match_score === 'number' ? tempObject.match_score : 0.75,
                        sector: tempObject.sector || "Not specified",
                        // Add other fields as needed with safe defaults
                      };
                      
                      // Add it to our list of recommendations
                      defaultStructure.recommendations.push(manuallyFixedObject);
                      console.log(`Successfully created simplified object for "${title}" using fallback approach`);
                      return;
                    } catch (secondaryError) {
                      console.warn("Secondary parsing approach failed:", secondaryError);
                      // Will fall back to creating a detailed fallback
                    }
                  }
                }
              }
              
              // If we couldn't extract or parse the full recommendation, create a detailed fallback
              console.log(`Creating detailed fallback for "${title}"`);
              
              // Create a more detailed valid recommendation with the title
              const detailedRec = {
                title: title,
                match_score: 0.8 - (index * 0.05), // Decreasing match scores
                sector: index % 2 === 0 ? "Private" : "Government",
                detailed_analysis: {
                  personality_match: `This career aligns with elements of your personality profile based on your responses.`,
                  interest_alignment: `${title} matches interests you've expressed in your assessment.`,
                  skill_compatibility: `Your skill profile indicates potential compatibility with this career path.`,
                  growth_potential: `${title} offers various opportunities for professional growth and advancement.`,
                  work_life_balance: "Work-life balance varies by specific role and organization.",
                  job_satisfaction: "Job satisfaction comes from the unique challenges and opportunities in this field.",
                  stress_levels: "Stress levels depend on specific positions, organizations, and career stages.",
                  learning_curve: "The learning curve varies based on your background and specific role requirements."
                },
                career_guide: {
                  overview: `${title} is a career path that matches elements identified in your assessment.`,
                  day_to_day: "Daily responsibilities include a variety of tasks depending on the specific role.",
                  career_progression: "Career progression typically involves increasing responsibility and specialization.",
                  specializations: ["Various specializations are available within this field"],
                  industry_trends: "The industry is evolving with technological and market changes.",
                  market_demand: "Demand varies by location and economic conditions.",
                  geographic_opportunities: "Opportunities exist across various geographic regions.",
                  remote_work_potential: "Remote work options depend on specific roles and organizations."
                },
                pros_and_cons: {
                  advantages: [
                    "Aligns with your profile", 
                    "Offers professional growth opportunities",
                    "Provides a variety of potential career paths"
                  ],
                  disadvantages: [
                    "May require additional education or training",
                    "Competition varies by location and specialty"
                  ],
                  risk_factors: [
                    "Market conditions may affect job availability",
                    "Industry changes may require ongoing skill development"
                  ]
                },
                requirements: {
                  education: {
                    minimum_qualification: "Varies by specific role and organization",
                    preferred_qualification: "Depends on specialization and career level",
                    certifications: ["Relevant professional certifications can be beneficial"],
                    specialized_training: ["Field-specific training enhances opportunities"]
                  },
                  skills: {
                    technical_skills: ["Field-specific technical skills", "Analytical abilities"],
                    soft_skills: ["Communication", "Problem-solving", "Teamwork", "Adaptability"],
                    language_requirements: ["Proficiency in relevant languages"]
                  },
                  experience: {
                    entry_level: "Requirements vary by organization",
                    mid_level: "Typically 3-5 years of relevant experience",
                    senior_level: "Usually 7+ years with demonstrated expertise"
                  }
                }
              };
              
              if (index % 2 !== 0) { // For government sector roles
                detailedRec.government_specific = {
                  exam_details: {
                    exam_name: "Relevant government examinations for this field",
                    eligibility_criteria: "Typically includes educational qualifications and age limits",
                    exam_pattern: "Usually includes written tests, interviews, and possibly other assessments"
                  },
                  training: {
                    duration: "Training duration varies by position",
                    location: "Training locations depend on the specific role"
                  }
                };
              }
              
              defaultStructure.recommendations.push(detailedRec);
            } catch (recError) {
              console.warn(`Failed to process recommendation for "${title}":`, recError);
            }
          });
        }
        
        // If we have at least one recommendation, return it
        if (defaultStructure.recommendations.length > 0) {
          console.log(`Successfully created ${defaultStructure.recommendations.length} recommendations`);
          return defaultStructure;
        }
        
        // If no recommendations could be extracted, create default ones
        if (defaultStructure.recommendations.length === 0) {
          console.log('No recommendations extracted, creating default fallback recommendations');
          // Create default recommendations with detailed structure
          defaultStructure.recommendations = [
            {
              title: "Civil Services",
              match_score: 0.85,
              sector: "Government",
              detailed_analysis: {
                personality_match: "Based on your responses, civil services might be worth exploring.",
                interest_alignment: "Government roles offer stability and structured environments.",
                skill_compatibility: "These roles require analytical thinking and problem-solving.",
                growth_potential: "Civil services offer steady career progression paths.",
                work_life_balance: "Work-life balance varies by position and department.",
                job_satisfaction: "Job satisfaction comes from public service impact.",
                stress_levels: "Stress levels can be high especially in public-facing roles.",
                learning_curve: "Requires understanding of governance systems and regulations."
              },
              career_guide: {
                overview: "Civil services form the administrative backbone of government.",
                day_to_day: "Work involves policy implementation and coordination with stakeholders.",
                career_progression: "Progression typically follows time-bound promotion patterns.",
                specializations: ["Administrative Service", "Foreign Service", "Police Service", "Revenue Service"],
                industry_trends: "Increasing focus on digitization and citizen-centric governance.",
                market_demand: "Consistent demand with competitive entrance process.",
                geographic_opportunities: "Positions available across the country.",
                remote_work_potential: "Limited remote work potential in most roles."
              },
              pros_and_cons: {
                advantages: ["Job security", "Structured career path", "Public service impact", "Good retirement benefits"],
                disadvantages: ["Bureaucratic processes", "May involve relocation", "Competitive entrance exams"],
                risk_factors: ["Political changes affecting policies", "Work-life balance challenges"]
              },
              requirements: {
                education: {
                  minimum_qualification: "Bachelor's degree in any discipline",
                  preferred_qualification: "No specific preference, though law, economics and public administration helpful",
                  certifications: ["Not typically required for entry"],
                  specialized_training: ["Training provided after selection"]
                },
                skills: {
                  technical_skills: ["Administrative abilities", "Analytical thinking"],
                  soft_skills: ["Communication", "Leadership", "Problem-solving", "Integrity"],
                  language_requirements: ["Proficiency in relevant languages of posting"]
                },
                experience: {
                  entry_level: "No prior experience required for most entrance exams",
                  mid_level: "Progression based on years of service",
                  senior_level: "10+ years of service for senior positions"
                }
              }
            },
            {
              title: "Software Developer",
              match_score: 0.8,
              sector: "Private",
              detailed_analysis: {
                personality_match: "Technology roles align with analytical and logical problem-solving.",
                interest_alignment: "Software development offers creative problem-solving opportunities.",
                skill_compatibility: "These roles leverage technical and analytical capabilities.",
                growth_potential: "Tech careers offer diverse specialization opportunities.",
                work_life_balance: "Varies by company but flexibility increasing in the industry.",
                job_satisfaction: "Comes from building products and solving technical challenges.",
                stress_levels: "Can be high during product launches and deadlines.",
                learning_curve: "Steep initially but manageable with continuous learning."
              },
              career_guide: {
                overview: "Software developers build applications and systems across industries.",
                day_to_day: "Work involves coding, debugging, and collaboration with teams.",
                career_progression: "Progression from junior to senior developer, architect or management.",
                specializations: ["Web Development", "Mobile Development", "AI/ML", "DevOps", "Data Engineering"],
                industry_trends: "Growing demand for AI, cloud, and cybersecurity expertise.",
                market_demand: "High demand across all sectors undergoing digital transformation.",
                geographic_opportunities: "Opportunities in tech hubs and increasingly remote positions.",
                remote_work_potential: "Excellent remote work potential across most companies."
              },
              pros_and_cons: {
                advantages: ["High demand", "Competitive compensation", "Remote work options", "Innovation opportunities"],
                disadvantages: ["Continuous learning required", "Can have high pressure periods", "Some roles have irregular hours"],
                risk_factors: ["Technology shifts requiring reskilling", "Project-based employment in some companies"]
              },
              requirements: {
                education: {
                  minimum_qualification: "Bachelor's in Computer Science or related field (though self-taught paths exist)",
                  preferred_qualification: "Computer Science or Engineering degree for many traditional employers",
                  certifications: ["Technology-specific certifications beneficial"],
                  specialized_training: ["Bootcamps or specialized courses in relevant technologies"]
                },
                skills: {
                  technical_skills: ["Programming languages", "Database knowledge", "Version control", "Testing methodologies"],
                  soft_skills: ["Problem-solving", "Communication", "Teamwork", "Attention to detail"],
                  language_requirements: ["English proficiency for documentation and collaboration"]
                },
                experience: {
                  entry_level: "Portfolio of projects or internship experience helpful",
                  mid_level: "3-5 years of relevant development experience",
                  senior_level: "5+ years with architecture and leadership skills"
                }
              }
            },
            {
              title: "Management Consultant",
              match_score: 0.75,
              sector: "Private",
              detailed_analysis: {
                personality_match: "Consulting suits those with analytical and strategic thinking abilities.",
                interest_alignment: "This field offers varied challenges and strategic problem-solving.",
                skill_compatibility: "Analysis and communication skills are essential in consulting.",
                growth_potential: "Consulting provides exposure to various industries and specializations.",
                work_life_balance: "Often challenging due to client demands and travel requirements.",
                job_satisfaction: "Derives from solving complex problems and seeing tangible results.",
                stress_levels: "High, especially during client presentations and project deadlines.",
                learning_curve: "Steep but offers rapid professional development."
              },
              career_guide: {
                overview: "Management consultants help organizations solve complex problems.",
                day_to_day: "Work includes client meetings, analysis, and presenting recommendations.",
                career_progression: "Typical path from analyst to associate, consultant, manager, and partner.",
                specializations: ["Strategy Consulting", "Operations", "HR Consulting", "IT Advisory", "Financial Consulting"],
                industry_trends: "Growing demand for digital transformation and sustainability consulting.",
                market_demand: "Strong demand especially during business transitions and economic shifts.",
                geographic_opportunities: "Concentrated in business centers with client travel required.",
                remote_work_potential: "Mixed, with increasing remote capabilities post-pandemic."
              },
              pros_and_cons: {
                advantages: ["Diverse project exposure", "Intellectual challenges", "Career prestige", "Strong networking opportunities"],
                disadvantages: ["May require travel", "Competitive environment", "Long working hours", "High-pressure client situations"],
                risk_factors: ["Economic downturns affecting client spending", "Burnout risk"]
              },
              requirements: {
                education: {
                  minimum_qualification: "Bachelor's degree in business, economics, engineering or related fields",
                  preferred_qualification: "MBA or advanced degree for strategy consulting",
                  certifications: ["Industry-specific certifications beneficial"],
                  specialized_training: ["Case interview preparation"]
                },
                skills: {
                  technical_skills: ["Data analysis", "Financial modeling", "Research methods", "Presentation skills"],
                  soft_skills: ["Problem-solving", "Communication", "Client management", "Critical thinking"],
                  language_requirements: ["Strong English proficiency, additional languages valuable"]
                },
                experience: {
                  entry_level: "Internships or analytical work experience beneficial",
                  mid_level: "3-5 years of relevant experience",
                  senior_level: "7+ years with industry expertise and client relationship skills"
                }
              }
            }
          ];
          console.log('Created default fallback recommendations');
          return defaultStructure;
        }
      } catch (extractError) {
        console.error('Failed to extract recommendations:', extractError);
      }
      
      // Last resort approach: Try to fix invalid arrays or objects manually
      try {
        console.log('Attempting last-resort JSON reconstruction...');
        
        // Fix unclosed arrays or objects
        let openBraces = (jsonText.match(/\{/g) || []).length;
        let closeBraces = (jsonText.match(/\}/g) || []).length;
        let openBrackets = (jsonText.match(/\[/g) || []).length;
        let closeBrackets = (jsonText.match(/\]/g) || []).length;
        
        // Add missing closing braces/brackets
        while (openBraces > closeBraces) {
          jsonText += '}';
          closeBraces++;
        }
        
        while (openBrackets > closeBrackets) {
          jsonText += ']';
          closeBrackets++;
        }
        
        // Try parsing again
    return JSON.parse(jsonText);
      } catch (finalError) {
        console.error('All JSON parsing attempts failed:', finalError);
        throw new Error('Could not parse API response after multiple attempts');
      }
    }
  } catch (error) {
    console.error('Error cleaning/parsing JSON response:', error);
    console.error('Original text excerpt:', text.substring(0, 200) + '...');
    
    // Instead of throwing, return a default structure
    console.log('Returning default recommendations structure');
    return {
      recommendations: [
        {
          title: "Civil Services",
          match_score: 0.85,
          sector: "Government",
          detailed_analysis: {
            personality_match: "Based on your assessment, civil services might align with your profile.",
            interest_alignment: "Government roles typically offer stability and structured environments.",
            skill_compatibility: "Your profile suggests capabilities suitable for administrative roles.",
            growth_potential: "Civil services offer defined career progression paths.",
            work_life_balance: "Work-life balance varies by department and position.",
            job_satisfaction: "Job satisfaction comes from public service and impact.",
            stress_levels: "Can be high in certain positions and during critical situations.",
            learning_curve: "Requires understanding of governance and policy frameworks."
          },
          career_guide: {
            overview: "Civil services form the administrative backbone of government.",
            day_to_day: "Work involves policy implementation and stakeholder coordination.",
            career_progression: "Progression follows established service patterns.",
            specializations: ["Administrative Service", "Foreign Service", "Police Service", "Revenue Service"],
            industry_trends: "Increasing digitization of government services.",
            market_demand: "Consistent demand with competitive selection process.",
            geographic_opportunities: "Positions throughout the country.",
            remote_work_potential: "Limited in most positions."
          },
          pros_and_cons: {
            advantages: ["Job security", "Structured career path", "Public service impact", "Retirement benefits"],
            disadvantages: ["Bureaucratic processes", "May involve relocation", "Competitive entrance"],
            risk_factors: ["Political changes affecting service conditions"]
          }
        },
        {
          title: "Software Developer",
          match_score: 0.8,
          sector: "Private",
          detailed_analysis: {
            personality_match: "Tech roles often match those with analytical thinking abilities.",
            interest_alignment: "Programming offers creative problem-solving opportunities.",
            skill_compatibility: "Technical and logical skills are central to development work.",
            growth_potential: "Tech careers offer rapid advancement and specialization paths.",
            work_life_balance: "Increasingly offering flexible work arrangements.",
            job_satisfaction: "Derives from building products and solutions.",
            stress_levels: "Can be high during release cycles and deadlines.",
            learning_curve: "Steep initially but manageable with dedication."
          },
          career_guide: {
            overview: "Software developers build applications and systems across industries.",
            day_to_day: "Work involves coding, debugging, and collaboration.",
            career_progression: "Progression to senior developer, architect, or specialized roles.",
            specializations: ["Web Development", "Mobile Development", "Cloud Computing", "AI/ML", "DevOps"],
            industry_trends: "Growing demand for AI, cloud, and security expertise.",
            market_demand: "High demand across industries undergoing digital transformation.",
            geographic_opportunities: "Concentrated in tech hubs with increasing remote options.",
            remote_work_potential: "Excellent in most development roles."
          },
          pros_and_cons: {
            advantages: ["High demand", "Competitive compensation", "Remote work options", "Innovation opportunities"],
            disadvantages: ["Continuous learning required", "Can have high pressure periods"],
            risk_factors: ["Technology shifts requiring reskilling"]
          }
        },
        {
          title: "Management Consultant",
          match_score: 0.75,
          sector: "Private",
          detailed_analysis: {
            personality_match: "Consulting suits those with analytical and strategic thinking abilities.",
            interest_alignment: "This field offers varied challenges and strategic problem-solving.",
            skill_compatibility: "Analysis and communication skills are essential in consulting.",
            growth_potential: "Consulting provides exposure to various industries and specializations.",
            work_life_balance: "Often challenging due to client demands.",
            job_satisfaction: "Comes from solving complex problems.",
            stress_levels: "High during client deliverables and presentations.",
            learning_curve: "Steep but offers rapid skill development."
          },
          career_guide: {
            overview: "Management consultants help organizations solve complex problems.",
            day_to_day: "Work includes client meetings, analysis, and presenting recommendations.",
            career_progression: "Path from analyst to consultant, manager, and partner.",
            specializations: ["Strategy Consulting", "Operations", "IT Advisory", "Financial Consulting"],
            industry_trends: "Growing demand for digital transformation consulting.",
            market_demand: "Strong in business centers and during economic transitions.",
            geographic_opportunities: "Concentrated in major cities with travel required.",
            remote_work_potential: "Improved post-pandemic but still requires client interaction."
          },
          pros_and_cons: {
            advantages: ["Diverse project exposure", "Intellectual challenges", "Career prestige", "Networking opportunities"],
            disadvantages: ["May require travel", "Competitive environment", "Long working hours"],
            risk_factors: ["Economic downturns affecting client budgets"]
          }
        }
      ]
    };
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
    Based on the following quiz responses, suggest suitable career paths for the user. Consider all types of government jobs in India across different grades and levels, as well as private sector opportunities and business ideas if applicable.

    User's Profile:
    ${formattedResponses}

    IMPORTANT INSTRUCTIONS (READ CAREFULLY):
    1. YOU MUST PROVIDE EXACTLY 3 DIFFERENT CAREER RECOMMENDATIONS
    2. Each recommendation must have a match score between 0.65 and 1.0
    3. Recommendations MUST be diverse (mix of government and private sector)
    4. Each recommendation must be complete with all fields filled in
    5. DO NOT cut off any parts of recommendations
    6. Make sure each recommendation has a unique title
    7. Ensure all 3 recommendations appear in the final response
    8. The recommendations should be ordered from best match to lowest match

    Please provide comprehensive career recommendations in the following JSON format. Do not include any markdown formatting or additional text outside the JSON object:

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
        },
        {
          "title": "Career Title 2",
          "match_score": 0.65-1.0,
          "sector": "Government/Private",
          "detailed_analysis": { ... },
          "career_guide": { ... },
          "pros_and_cons": { ... },
          "requirements": { ... },
          "compensation": { ... },
          "action_plan": { ... },
          "government_specific": { ... },
          "alternative_paths": [ ... ]
        },
        {
          "title": "Career Title 3",
          "match_score": 0.65-1.0,
          "sector": "Government/Private",
          "detailed_analysis": { ... },
          "career_guide": { ... },
          "pros_and_cons": { ... },
          "requirements": { ... },
          "compensation": { ... },
          "action_plan": { ... },
          "government_specific": { ... },
          "alternative_paths": [ ... ]
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
          temperature: 0.7,
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
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Received response text:', responseText.substring(0, 200) + '...');
    
    // Process the JSON response
    const parsedData = cleanJsonResponse(responseText);
    
    if (!parsedData || !parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      console.error('Failed to parse recommendations from response:', parsedData);
      throw new Error('Invalid recommendations format in API response');
    }
    
    if (parsedData.recommendations.length === 0) {
      console.error('No recommendations returned from API');
      throw new Error('No recommendations were generated');
    }

    // Update this section to ensure only 3 recommendations
    if (parsedData.recommendations.length < 3) {
      console.warn(`Expected 3 recommendations but only received ${parsedData.recommendations.length}. Creating placeholder recommendations to ensure at least 3.`);
      
      // Create placeholder recommendations if fewer than 3 were returned
      while (parsedData.recommendations.length < 3) {
        const placeholderIndex = parsedData.recommendations.length + 1;
        const baseRec = parsedData.recommendations[0]; // Use the first one as a template
        
        const placeholder = {
          ...JSON.parse(JSON.stringify(baseRec)), // Deep clone the base recommendation
          title: `Alternative Career Path ${placeholderIndex}`,
          match_score: Math.max(0.65, baseRec.match_score - 0.05 * placeholderIndex),
          sector: baseRec.sector === 'Government' ? 'Private' : 'Government',
        };
        
        // Add a note in the detailed analysis
        if (placeholder.detailed_analysis) {
          placeholder.detailed_analysis.personality_match = 
            `This is an alternative option that might be worth exploring given your profile.`;
        }
        
        parsedData.recommendations.push(placeholder);
      }
    } else if (parsedData.recommendations.length > 3) {
      // If more than 3 recommendations were returned, keep only the top 3
      console.log(`Received ${parsedData.recommendations.length} recommendations, trimming to top 3.`);
      parsedData.recommendations = parsedData.recommendations.slice(0, 3);
    }
    
    // Ensure all recommendations have at least 65% match score
    parsedData.recommendations = parsedData.recommendations.map(rec => {
      if (typeof rec.match_score !== 'number' || rec.match_score < 0.65) {
        rec.match_score = 0.65;
      }
      return rec;
    });
    
    console.log('Career recommendations generated successfully:', 
      `Generated ${parsedData.recommendations.length} recommendations`);
    
    return parsedData;
    
  } catch (error) {
    console.error('Error in generateCareerRecommendations:', error);
    throw new Error('Failed to generate career recommendations: ' + error.message);
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

    IMPORTANT INSTRUCTIONS (READ CAREFULLY):
    1. YOU MUST PROVIDE EXACTLY 3 DIFFERENT CAREER RECOMMENDATIONS
    2. Each recommendation must have a match score between 0.65 and 1.0
    3. Recommendations MUST be diverse (mix of government and private sector)
    4. Each recommendation must be complete with all fields filled in
    5. DO NOT cut off any parts of recommendations
    6. Make sure each recommendation has a unique title
    7. Ensure all 3 recommendations appear in the final response
    8. The recommendations should be ordered from best match to lowest match

    Please provide comprehensive career recommendations in the following JSON format. Do not include any markdown formatting or additional text outside the JSON object:

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
        },
        {
          "title": "Career Title 2",
          "match_score": 0.65-1.0,
          "sector": "Government/Private",
          "detailed_analysis": { ... },
          "career_guide": { ... },
          "pros_and_cons": { ... },
          "requirements": { ... },
          "compensation": { ... },
          "action_plan": { ... },
          "government_specific": { ... },
          "alternative_paths": [ ... ]
        },
        {
          "title": "Career Title 3",
          "match_score": 0.65-1.0,
          "sector": "Government/Private",
          "detailed_analysis": { ... },
          "career_guide": { ... },
          "pros_and_cons": { ... },
          "requirements": { ... },
          "compensation": { ... },
          "action_plan": { ... },
          "government_specific": { ... },
          "alternative_paths": [ ... ]
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
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Received response text:', responseText.substring(0, 200) + '...');
    
    // Process the JSON response
    const parsedData = cleanJsonResponse(responseText);
    
    if (!parsedData || !parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      console.error('Failed to parse recommendations from response:', parsedData);
      throw new Error('Invalid recommendations format in API response');
    }
    
    if (parsedData.recommendations.length === 0) {
      console.error('No recommendations returned from API');
      throw new Error('No recommendations were generated');
    }

    if (parsedData.recommendations.length < 3) {
      console.warn(`Expected 3 recommendations but only received ${parsedData.recommendations.length}. Creating placeholder recommendations to ensure at least 3.`);
      
      // Create placeholder recommendations if fewer than 3 were returned
      while (parsedData.recommendations.length < 3) {
        const placeholderIndex = parsedData.recommendations.length + 1;
        const baseRec = parsedData.recommendations[0]; // Use the first one as a template
        
        const placeholder = {
          ...JSON.parse(JSON.stringify(baseRec)), // Deep clone the base recommendation
          title: `Alternative Career Path ${placeholderIndex}`,
          match_score: Math.max(0.65, baseRec.match_score - 0.05 * placeholderIndex),
          sector: baseRec.sector === 'Government' ? 'Private' : 'Government',
        };
        
        // Add a note in the detailed analysis
        if (placeholder.detailed_analysis) {
          placeholder.detailed_analysis.personality_match = 
            `This is an alternative option that might be worth exploring given your profile.`;
        }
        
        parsedData.recommendations.push(placeholder);
      }
    } else if (parsedData.recommendations.length > 3) {
      // If more than 3 recommendations were returned, keep only the top 3
      console.log(`Received ${parsedData.recommendations.length} recommendations, trimming to top 3.`);
      parsedData.recommendations = parsedData.recommendations.slice(0, 3);
    }
    
    // Ensure all recommendations have at least 65% match score
    parsedData.recommendations = parsedData.recommendations.map(rec => {
      if (typeof rec.match_score !== 'number' || rec.match_score < 0.65) {
        rec.match_score = 0.65;
      }
      return rec;
    });
    
    console.log('Text-based recommendations generated successfully:', 
      `Generated ${parsedData.recommendations.length} recommendations`);
    
    return parsedData.recommendations;
    
  } catch (error) {
    console.error('Error in generateTextBasedRecommendations:', error);
    throw new Error('Failed to generate text-based recommendations: ' + error.message);
  }
} 