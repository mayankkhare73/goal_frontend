import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import AssessmentHistory from '@/models/AssessmentHistory';
import { generateCareerRecommendations } from '@/services/gptService';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Convert user ID to string explicitly to ensure it matches the expected format
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    console.log('User ID from session:', userId);
    
    const { responses } = await request.json();

    // Validate responses
    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Invalid responses format' }, { status: 400 });
    }

    await connectDB();

    // Format responses with questionId
    const formattedResponses = await Promise.all(responses.map(async (response) => {
      if (!response.questionId) {
        throw new Error('Question ID is required for each response');
      }

      // Verify the question exists
      const question = await Question.findById(response.questionId);
      if (!question) {
        throw new Error(`Question not found with ID: ${response.questionId}`);
      }

      return {
        questionId: response.questionId,
        answer: response.answer,
        timestamp: new Date()
      };
    }));

    // Generate recommendations
    console.log('Generating career recommendations for quiz responses...');
    let recommendationsData;
    try {
      recommendationsData = await generateCareerRecommendations(responses);
      
      // Validate that we have recommendations and they're properly structured
      if (!recommendationsData || !recommendationsData.recommendations || !Array.isArray(recommendationsData.recommendations)) {
        console.error('Invalid recommendations format received:', recommendationsData);
        throw new Error('Failed to generate valid recommendations format');
      }
      
      if (recommendationsData.recommendations.length === 0) {
        console.error('No recommendations were generated');
        throw new Error('No career recommendations were generated for your responses');
      }
      
      // Validate each recommendation has essential fields
      const validatedRecommendations = recommendationsData.recommendations.map(rec => {
        // Create a deep clone of the recommendation to avoid modifying the original
        const validatedRec = JSON.parse(JSON.stringify(rec));
        
        // Ensure required fields exist
        if (!validatedRec.title) validatedRec.title = "Career Option";
        if (typeof validatedRec.match_score !== 'number') validatedRec.match_score = 0.7;
        if (!validatedRec.sector) validatedRec.sector = "Unspecified";
        
        // Ensure detailed_analysis exists with all expected fields
        if (!validatedRec.detailed_analysis) {
          validatedRec.detailed_analysis = {};
        }
        
        // Preserve all existing fields and only add missing ones
        const detailedAnalysis = validatedRec.detailed_analysis;
        if (!detailedAnalysis.personality_match) {
          detailedAnalysis.personality_match = "This career aligns with elements identified in your assessment profile.";
        }
        if (!detailedAnalysis.interest_alignment) {
          detailedAnalysis.interest_alignment = "This path connects with interests expressed in your responses.";
        }
        if (!detailedAnalysis.skill_compatibility) {
          detailedAnalysis.skill_compatibility = "Your profile indicates compatibility with skills needed in this field.";
        }
        if (!detailedAnalysis.growth_potential) {
          detailedAnalysis.growth_potential = "This career offers various growth and advancement opportunities.";
        }
        if (!detailedAnalysis.work_life_balance) {
          detailedAnalysis.work_life_balance = "Work-life balance varies by specific role and organization.";
        }
        if (!detailedAnalysis.job_satisfaction) {
          detailedAnalysis.job_satisfaction = "Job satisfaction in this field stems from its unique challenges and opportunities.";
        }
        if (!detailedAnalysis.stress_levels) {
          detailedAnalysis.stress_levels = "Stress levels vary depending on specific roles, organizations, and career stages.";
        }
        if (!detailedAnalysis.learning_curve) {
          detailedAnalysis.learning_curve = "The learning curve depends on your background and the specific role requirements.";
        }
        
        // Ensure career_guide exists with all expected fields
        if (!validatedRec.career_guide) {
          validatedRec.career_guide = {};
        }
        
        // Preserve all existing fields and only add missing ones
        const careerGuide = validatedRec.career_guide;
        if (!careerGuide.overview) {
          careerGuide.overview = `${validatedRec.title} is a career path that matches elements of your profile.`;
        }
        if (!careerGuide.day_to_day) {
          careerGuide.day_to_day = "Daily responsibilities vary based on specific roles and organizations.";
        }
        if (!careerGuide.career_progression) {
          careerGuide.career_progression = "Career progression typically involves increasing responsibility and specialization.";
        }
        if (!careerGuide.specializations) {
          careerGuide.specializations = ["Various specializations are available in this field"];
        }
        if (!careerGuide.industry_trends) {
          careerGuide.industry_trends = "The industry is evolving with technological and policy changes.";
        }
        if (!careerGuide.market_demand) {
          careerGuide.market_demand = "Market demand varies by location and economic conditions.";
        }
        if (!careerGuide.geographic_opportunities) {
          careerGuide.geographic_opportunities = "Opportunities exist across various geographic locations.";
        }
        if (!careerGuide.remote_work_potential) {
          careerGuide.remote_work_potential = "Remote work options depend on specific roles and organizations.";
        }
        
        // Ensure pros_and_cons exists with expected structure
        if (!validatedRec.pros_and_cons) {
          validatedRec.pros_and_cons = {};
        }
        
        const prosAndCons = validatedRec.pros_and_cons;
        if (!prosAndCons.advantages || !Array.isArray(prosAndCons.advantages) || prosAndCons.advantages.length === 0) {
          prosAndCons.advantages = ["Matches elements of your assessment profile", "Provides professional development opportunities"];
        }
        if (!prosAndCons.disadvantages || !Array.isArray(prosAndCons.disadvantages) || prosAndCons.disadvantages.length === 0) {
          prosAndCons.disadvantages = ["May require additional training or education", "Consider researching specific requirements"];
        }
        if (!prosAndCons.risk_factors || !Array.isArray(prosAndCons.risk_factors)) {
          prosAndCons.risk_factors = ["Market conditions may affect job availability"];
        }
        
        // Ensure requirements section exists
        if (!validatedRec.requirements) {
          validatedRec.requirements = {
            education: {
              minimum_qualification: "Varies by specific role",
              preferred_qualification: "Depends on the organization and position level",
              certifications: ["Relevant professional certifications may be beneficial"],
              specialized_training: ["Specific training may enhance career prospects"]
            },
            skills: {
              technical_skills: ["Relevant technical skills for the field"],
              soft_skills: ["Communication", "Problem-solving", "Teamwork"],
              language_requirements: ["Proficiency in relevant languages"]
            },
            experience: {
              entry_level: "Requirements for entry positions vary by organization",
              mid_level: "Typically requires some relevant experience",
              senior_level: "Usually requires substantial experience and expertise"
            }
          };
        }
        
        // Ensure compensation section exists
        if (!validatedRec.compensation) {
          validatedRec.compensation = {
            salary_ranges: {
              entry_level: "Varies by organization and location",
              mid_level: "Increases with experience and responsibility",
              senior_level: "Reflects expertise and leadership responsibilities",
              top_performers: "Top performers may receive additional compensation"
            },
            benefits: ["May include health insurance", "Retirement plans", "Other organization-specific benefits"],
            bonus_structure: "Varies by organization and role",
            retirement_benefits: "Typically includes standard retirement plans"
          };
        }
        
        // Ensure action_plan exists
        if (!validatedRec.action_plan) {
          validatedRec.action_plan = {
            immediate_steps: ["Research specific roles and requirements", "Identify skill gaps"],
            short_term_goals: ["Develop relevant skills", "Build professional network"],
            resources: {
              books: ["Relevant industry publications"],
              online_courses: ["Field-specific courses"],
              websites: ["Professional association websites", "Industry forums"],
              organizations: ["Professional associations in this field"]
            }
          };
        }
        
        // For government-specific roles, ensure government_specific section exists
        if (validatedRec.sector === "Government" && !validatedRec.government_specific) {
          validatedRec.government_specific = {
            exam_details: {
              exam_name: "Relevant government examination",
              eligibility_criteria: "Varies by position and department",
              exam_pattern: "Typically includes written tests and interviews"
            },
            training: {
              duration: "Varies by position",
              location: "Training locations depend on the specific role"
            }
          };
        }
        
        // Ensure alternative_paths exists
        if (!validatedRec.alternative_paths || !Array.isArray(validatedRec.alternative_paths) || validatedRec.alternative_paths.length === 0) {
          validatedRec.alternative_paths = [
            {
              title: "Related career option",
              reason: "Requires similar skills and interests",
              transition_path: "Build on transferable skills and experience"
            }
          ];
        }
        
        return validatedRec;
      });
      
      // Replace the recommendations with the validated ones
      recommendationsData.recommendations = validatedRecommendations;
      
    } catch (recommendationError) {
      console.error('Error generating recommendations:', recommendationError);
      
      // Return a more detailed fallback set of recommendations
      recommendationsData = {
        recommendations: [
          {
            title: "Civil Services",
            match_score: 0.85,
            sector: "Government",
            detailed_analysis: {
              personality_match: "Based on your responses, you appear to have strong analytical abilities and a desire to contribute to society, which aligns well with civil services roles.",
              interest_alignment: "Your interests indicate you value stability and structured environments, which are hallmarks of government service.",
              skill_compatibility: "Your skills align with the analytical thinking and problem-solving required in administrative roles.",
              growth_potential: "Civil services offer steady career progression through various grades and specialized departments."
            },
            career_guide: {
              overview: "Civil services form the administrative backbone of the government, implementing policies and ensuring public welfare.",
              day_to_day: "Work involves policy implementation, public interaction, report preparation, and coordination with various stakeholders.",
              career_progression: "Progression typically follows a time-bound promotion system with opportunities to specialize in specific domains.",
              specializations: ["Administrative Service", "Foreign Service", "Police Service", "Revenue Service"],
              industry_trends: "Increasing digitization of government services and citizen-centric governance models.",
              market_demand: "Consistent demand with competitive selection processes.",
              geographic_opportunities: "Positions available across the country with periodic transfers.",
              remote_work_potential: "Limited remote work options except for special circumstances."
            },
            pros_and_cons: {
              advantages: [
                "Job security and stability",
                "Respectable social status",
                "Wide range of departments to work in",
                "Opportunity to impact policy and governance",
                "Good retirement benefits"
              ],
              disadvantages: [
                "Bureaucratic constraints",
                "Initial postings might be in remote locations",
                "Frequent transfers possible",
                "Competitive entrance process",
                "May involve political pressures"
              ],
              risk_factors: [
                "Policy changes affecting service conditions",
                "Work-life balance challenges during intense periods"
              ]
            },
            requirements: {
              education: {
                minimum_qualification: "Bachelor's degree in any discipline",
                preferred_qualification: "No specific preference, though law, public administration, and economics are valuable",
                certifications: ["Not mandatory for entry"],
                specialized_training: ["Training provided after selection"]
              },
              skills: {
                technical_skills: ["Administrative abilities", "Analytical thinking", "Basic digital literacy"],
                soft_skills: ["Communication", "Leadership", "Problem-solving", "Adaptability", "Integrity"],
                language_requirements: ["Proficiency in English and regional languages relevant to posting"]
              }
            }
          },
          {
            title: "Software Developer",
            match_score: 0.79,
            sector: "Private",
            detailed_analysis: {
              personality_match: "Your responses suggest analytical thinking and problem-solving orientation that fits well with software development.",
              interest_alignment: "You show interest in logical systems and creative solutions, which are central to programming work.",
              skill_compatibility: "Your skill profile aligns with the technical and analytical requirements of software development.",
              growth_potential: "This field offers rapid growth opportunities and diverse specialization paths."
            },
            career_guide: {
              overview: "Software developers create applications that enable users to perform specific tasks on computers or other devices.",
              day_to_day: "Work involves writing code, debugging, participating in code reviews, and collaborating with team members.",
              career_progression: "Career paths include senior developer, tech lead, architect, or specialized roles in specific domains.",
              specializations: ["Web Development", "Mobile App Development", "AI/ML Engineer", "DevOps", "Backend Systems"],
              industry_trends: "Increasing demand for cloud-native applications, AI integration, and cybersecurity expertise.",
              market_demand: "High demand across all industries undergoing digital transformation.",
              geographic_opportunities: "Concentrated in tech hubs but growing nationwide with remote options.",
              remote_work_potential: "Excellent remote work opportunities across most companies."
            },
            pros_and_cons: {
              advantages: [
                "High demand across industries",
                "Competitive compensation",
                "Remote work possibilities",
                "Continuous learning opportunities",
                "Creative problem-solving environment"
              ],
              disadvantages: [
                "Requires continuous learning to stay relevant",
                "Can involve tight deadlines and project pressures",
                "Some positions have irregular hours during releases",
                "Risk of burnout in high-pressure environments"
              ],
              risk_factors: [
                "Technology shifts requiring reskilling",
                "Outsourcing of certain types of development work",
                "Project-based employment in some companies"
              ]
            },
            requirements: {
              education: {
                minimum_qualification: "Bachelor's degree in Computer Science or related field (though self-taught developers are common)",
                preferred_qualification: "Computer Science or Engineering degree for traditional employers",
                certifications: ["Language or framework-specific certifications can be helpful"],
                specialized_training: ["Bootcamps or specialized courses in relevant technologies"]
              },
              skills: {
                technical_skills: ["Programming languages (Python, JavaScript, Java, etc.)", "Version control systems", "Testing methodologies", "Database knowledge"],
                soft_skills: ["Problem-solving", "Communication", "Teamwork", "Attention to detail", "Time management"],
                language_requirements: ["English proficiency for documentation and collaboration"]
              }
            }
          },
          {
            title: "Management Consultant",
            match_score: 0.75,
            sector: "Private",
            detailed_analysis: {
              personality_match: "Your analytical mindset and interest in solving complex problems make you suitable for consulting roles.",
              interest_alignment: "Your interests suggest you enjoy varied challenges and strategic thinking, which consulting provides.",
              skill_compatibility: "Your skill set matches the analytical and communication abilities needed in consulting.",
              growth_potential: "Consulting offers steep learning curves and paths to specialization in specific industries."
            },
            career_guide: {
              overview: "Management consultants help organizations improve performance through analysis of existing problems and development of plans for improvement.",
              day_to_day: "Work involves client meetings, data analysis, report preparation, and presenting findings and recommendations.",
              career_progression: "Typical path from analyst to associate consultant, consultant, senior consultant, manager, and partner.",
              specializations: ["Strategy Consulting", "Operations Consulting", "HR Consulting", "IT Consulting", "Financial Advisory"],
              industry_trends: "Growing demand for digital transformation, sustainability consulting, and post-pandemic business model reinvention.",
              market_demand: "Strong demand especially during economic transitions and industry disruptions.",
              geographic_opportunities: "Concentrated in major business centers but with travel to client locations.",
              remote_work_potential: "Mixed, with client-facing activities requiring in-person presence but analysis possible remotely."
            },
            pros_and_cons: {
              advantages: [
                "Exposure to various industries and business challenges",
                "Intellectual challenges and continuous learning",
                "Prestigious career path with strong networking opportunities",
                "Rapid skill development",
                "Above-average compensation"
              ],
              disadvantages: [
                "Extensive travel may be required",
                "High-pressure environment with demanding clients",
                "Long working hours, especially during project deadlines",
                "Competitive workplace culture",
                "Work-life balance challenges"
              ],
              risk_factors: [
                "Project-based nature can lead to utilization pressure",
                "Economic downturns may affect client spending on consulting services",
                "Burnout risk due to intensity and travel demands"
              ]
            },
            requirements: {
              education: {
                minimum_qualification: "Bachelor's degree in business, economics, engineering or related fields",
                preferred_qualification: "MBA or advanced degree for strategy consulting",
                certifications: ["Specialized certifications beneficial for specific consulting types"],
                specialized_training: ["Case study preparation for interviews"]
              },
              skills: {
                technical_skills: ["Data analysis", "Financial modeling", "Project management", "Research methods"],
                soft_skills: ["Analytical thinking", "Communication", "Presentation skills", "Client management", "Problem-solving"],
                language_requirements: ["Strong English proficiency, additional languages valuable for international consulting"]
              }
            }
          }
        ],
        error_details: recommendationError.message,
        is_fallback: true
      };
    }
    
    // Use the recommendations data consistently for saving and returning
    const recommendations = recommendationsData.recommendations;
    
    console.log(`Using ${recommendations.length} career recommendations`);

    // Normalize the recommendations data to prevent schema validation errors
    const normalizedRecommendations = recommendationsData.recommendations.map(rec => {
      const normalized = { ...rec };
      
      // Ensure compensation object exists
      if (!normalized.compensation) {
        normalized.compensation = {};
      }
      
      // Handle the retirement_benefits field - convert arrays to strings if needed
      if (normalized.compensation.retirement_benefits) {
        if (Array.isArray(normalized.compensation.retirement_benefits)) {
          normalized.compensation.retirement_benefits = normalized.compensation.retirement_benefits.join(', ');
        }
      }
      
      // Normalize other potentially problematic fields
      // Make sure all required array fields exist and are arrays
      if (!normalized.pros_and_cons) normalized.pros_and_cons = {};
      if (!Array.isArray(normalized.pros_and_cons.advantages)) normalized.pros_and_cons.advantages = ["Not specified"];
      if (!Array.isArray(normalized.pros_and_cons.disadvantages)) normalized.pros_and_cons.disadvantages = ["Not specified"];
      if (!Array.isArray(normalized.pros_and_cons.risk_factors)) normalized.pros_and_cons.risk_factors = ["Not specified"];
      
      if (!normalized.career_guide) normalized.career_guide = {};
      if (!Array.isArray(normalized.career_guide.specializations)) normalized.career_guide.specializations = ["Not specified"];
      
      if (!normalized.requirements) normalized.requirements = {};
      if (!normalized.requirements.education) normalized.requirements.education = {};
      if (!Array.isArray(normalized.requirements.education.certifications)) 
        normalized.requirements.education.certifications = ["Not specified"];
      if (!Array.isArray(normalized.requirements.education.specialized_training)) 
        normalized.requirements.education.specialized_training = ["Not specified"];
        
      if (!normalized.requirements.skills) normalized.requirements.skills = {};
      if (!Array.isArray(normalized.requirements.skills.technical_skills)) 
        normalized.requirements.skills.technical_skills = ["Not specified"];
      if (!Array.isArray(normalized.requirements.skills.soft_skills)) 
        normalized.requirements.skills.soft_skills = ["Not specified"];
      if (!Array.isArray(normalized.requirements.skills.language_requirements)) 
        normalized.requirements.skills.language_requirements = ["Not specified"];
        
      if (!normalized.compensation) normalized.compensation = {};
      if (!Array.isArray(normalized.compensation.benefits)) normalized.compensation.benefits = ["Not specified"];
      
      if (!normalized.action_plan) normalized.action_plan = {};
      if (!Array.isArray(normalized.action_plan.immediate_steps)) normalized.action_plan.immediate_steps = ["Not specified"];
      if (!Array.isArray(normalized.action_plan.short_term_goals)) normalized.action_plan.short_term_goals = ["Not specified"];
      
      if (!normalized.action_plan.resources) normalized.action_plan.resources = {};
      if (!Array.isArray(normalized.action_plan.resources.books)) normalized.action_plan.resources.books = ["Not specified"];
      if (!Array.isArray(normalized.action_plan.resources.online_courses)) normalized.action_plan.resources.online_courses = ["Not specified"];
      if (!Array.isArray(normalized.action_plan.resources.websites)) normalized.action_plan.resources.websites = ["Not specified"];
      if (!Array.isArray(normalized.action_plan.resources.organizations)) normalized.action_plan.resources.organizations = ["Not specified"];
      
      // Ensure alternative_paths is an array
      if (!Array.isArray(normalized.alternative_paths)) normalized.alternative_paths = [];
      
      return normalized;
    });

    // Create an assessment record with user ID and responses
    try {
      await connectDB();
      
      // Save to assessment history
      const assessment = new AssessmentHistory({
        user: userId,
        responses: formattedResponses,
        recommendations: recommendationsData.recommendations,
        type: 'quiz'
      });
  
      await assessment.save();
      console.log('Quiz assessment saved successfully with ID:', assessment._id);
      
      // Return assessment ID along with recommendations
      return NextResponse.json({ 
        recommendations: recommendationsData.recommendations,
        assessmentId: assessment._id.toString(),
        success: true 
      });
      
    } catch (dbError) {
      console.error('Error saving assessment to database:', dbError);
      // Return the recommendations even if DB save fails, but without the assessment ID
      return NextResponse.json({ 
        recommendations: recommendationsData.recommendations,
        success: true 
      });
    }
  } catch (error) {
    console.error('Error processing quiz submission:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
} 