import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import AssessmentHistory from '@/models/AssessmentHistory';
import { generateTextBasedRecommendations } from '@/services/gptService';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('Unauthorized text-recommendations request - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Processing text recommendations for user:', session.user.id);
    const userId = session.user.id;
    
    // Parse request body
    let textInput;
    try {
      const body = await request.json();
      textInput = body.textInput;
    } catch (e) {
      console.error('Invalid request body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    if (!textInput) {
      console.log('Text input is missing in the request');
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    console.log('Generating text-based recommendations for text input:', textInput.substring(0, 100) + '...');
    
    // Generate recommendations using the text-based function
    let recommendations;
    try {
      recommendations = await generateTextBasedRecommendations(textInput);
      console.log(`Successfully generated ${recommendations.length} recommendations`);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return NextResponse.json({ 
        error: 'Failed to generate recommendations', 
        details: error.message 
      }, { status: 500 });
    }
    
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      console.error('Invalid recommendations returned from service:', recommendations);
      return NextResponse.json({ error: 'Failed to generate valid recommendations' }, { status: 500 });
    }

    // Format recommendations to match the schema
    const formattedRecommendations = recommendations.map(rec => ({
      title: rec.title || '',
      match_score: rec.match_score || 0.5,
      sector: rec.sector || 'Private',
      detailed_analysis: {
        personality_match: rec.detailed_analysis?.personality_match || '',
        interest_alignment: rec.detailed_analysis?.interest_alignment || '',
        skill_compatibility: rec.detailed_analysis?.skill_compatibility || '',
        growth_potential: rec.detailed_analysis?.growth_potential || '',
        work_life_balance: rec.detailed_analysis?.work_life_balance || '',
        job_satisfaction: rec.detailed_analysis?.job_satisfaction || '',
        stress_levels: rec.detailed_analysis?.stress_levels || '',
        learning_curve: rec.detailed_analysis?.learning_curve || ''
      },
      career_guide: {
        overview: rec.career_guide?.overview || '',
        day_to_day: rec.career_guide?.day_to_day || '',
        career_progression: rec.career_guide?.career_progression || '',
        specializations: Array.isArray(rec.career_guide?.specializations) ? rec.career_guide.specializations : [],
        industry_trends: rec.career_guide?.industry_trends || '',
        market_demand: rec.career_guide?.market_demand || '',
        geographic_opportunities: rec.career_guide?.geographic_opportunities || '',
        remote_work_potential: rec.career_guide?.remote_work_potential || ''
      },
      pros_and_cons: {
        advantages: Array.isArray(rec.pros_and_cons?.advantages) ? rec.pros_and_cons.advantages : [],
        disadvantages: Array.isArray(rec.pros_and_cons?.disadvantages) ? rec.pros_and_cons.disadvantages : [],
        risk_factors: Array.isArray(rec.pros_and_cons?.risk_factors) ? rec.pros_and_cons.risk_factors : []
      },
      requirements: {
        education: {
          minimum_qualification: rec.requirements?.education?.minimum_qualification || '',
          preferred_qualification: rec.requirements?.education?.preferred_qualification || '',
          certifications: Array.isArray(rec.requirements?.education?.certifications) ? rec.requirements.education.certifications : [],
          specialized_training: Array.isArray(rec.requirements?.education?.specialized_training) ? rec.requirements.education.specialized_training : []
        },
        skills: {
          technical_skills: Array.isArray(rec.requirements?.skills?.technical_skills) ? rec.requirements.skills.technical_skills : [],
          soft_skills: Array.isArray(rec.requirements?.skills?.soft_skills) ? rec.requirements.skills.soft_skills : [],
          language_requirements: Array.isArray(rec.requirements?.skills?.language_requirements) ? rec.requirements.skills.language_requirements : []
        },
        experience: {
          entry_level: rec.requirements?.experience?.entry_level || '',
          mid_level: rec.requirements?.experience?.mid_level || '',
          senior_level: rec.requirements?.experience?.senior_level || ''
        }
      },
      compensation: {
        salary_ranges: {
          entry_level: rec.compensation?.salary_ranges?.entry_level || '',
          mid_level: rec.compensation?.salary_ranges?.mid_level || '',
          senior_level: rec.compensation?.salary_ranges?.senior_level || '',
          top_performers: rec.compensation?.salary_ranges?.top_performers || ''
        },
        benefits: Array.isArray(rec.compensation?.benefits) ? rec.compensation.benefits : [],
        bonus_structure: rec.compensation?.bonus_structure || '',
        retirement_benefits: rec.compensation?.retirement_benefits || ''
      },
      action_plan: {
        immediate_steps: Array.isArray(rec.action_plan?.immediate_steps) ? rec.action_plan.immediate_steps : [],
        short_term_goals: Array.isArray(rec.action_plan?.short_term_goals) ? rec.action_plan.short_term_goals : [],
        resources: {
          books: Array.isArray(rec.action_plan?.resources?.books) ? rec.action_plan.resources.books : [],
          online_courses: Array.isArray(rec.action_plan?.resources?.online_courses) ? rec.action_plan.resources.online_courses : [],
          websites: Array.isArray(rec.action_plan?.resources?.websites) ? rec.action_plan.resources.websites : [],
          organizations: Array.isArray(rec.action_plan?.resources?.organizations) ? rec.action_plan.resources.organizations : []
        }
      },
      government_specific: {
        exam_details: {
          exam_name: rec.government_specific?.exam_details?.exam_name || '',
          eligibility_criteria: rec.government_specific?.exam_details?.eligibility_criteria || '',
          exam_pattern: rec.government_specific?.exam_details?.exam_pattern || ''
        },
        training: {
          duration: rec.government_specific?.training?.duration || '',
          location: rec.government_specific?.training?.location || ''
        }
      },
      alternative_paths: Array.isArray(rec.alternative_paths) ? rec.alternative_paths.map(path => ({
        title: path.title || '',
        reason: path.reason || '',
        transition_path: path.transition_path || ''
      })) : []
    }));

    try {
      await connectDB();
      
      // Save to assessment history
      const assessment = new AssessmentHistory({
        user: userId,
        responses: [], // No quiz responses for text-based input
        recommendations: formattedRecommendations,
        type: 'text-based',
        inputText: textInput
      });
  
      await assessment.save();
      console.log('Text-based assessment saved successfully with ID:', assessment._id);
      
      // Return assessment ID along with recommendations
      return NextResponse.json({ 
        recommendations: formattedRecommendations,
        assessmentId: assessment._id.toString(),
        success: true
      });
    } catch (dbError) {
      // Still return the recommendations even if saving to DB fails
      console.error('Error saving assessment to database:', dbError);
      // Continue with returning the recommendations, but without the assessment ID
      return NextResponse.json({ 
        recommendations: formattedRecommendations,
        success: true
      });
    }
  } catch (error) {
    console.error('Error in text-recommendations endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to generate recommendations', 
      details: error.message 
    }, { status: 500 });
  }
} 