import mongoose from 'mongoose';

const assessmentHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    answer: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  recommendations: [{
    title: String,
    match_score: Number,
    sector: String,
    detailed_analysis: {
      personality_match: String,
      interest_alignment: String,
      skill_compatibility: String,
      growth_potential: String,
      work_life_balance: String,
      job_satisfaction: String,
      stress_levels: String,
      learning_curve: String
    },
    career_guide: {
      overview: String,
      day_to_day: String,
      career_progression: String,
      specializations: [String],
      industry_trends: String,
      market_demand: String,
      geographic_opportunities: String,
      remote_work_potential: String
    },
    pros_and_cons: {
      advantages: [String],
      disadvantages: [String],
      risk_factors: [String]
    },
    requirements: {
      education: {
        minimum_qualification: String,
        preferred_qualification: String,
        certifications: [String],
        specialized_training: [String]
      },
      skills: {
        technical_skills: [String],
        soft_skills: [String],
        language_requirements: [String]
      },
      experience: {
        entry_level: String,
        mid_level: String,
        senior_level: String
      }
    },
    compensation: {
      salary_ranges: {
        entry_level: String,
        mid_level: String,
        senior_level: String,
        top_performers: String
      },
      benefits: [String],
      bonus_structure: String,
      retirement_benefits: {
        type: mongoose.Schema.Types.Mixed,
        default: ""
      }
    },
    action_plan: {
      immediate_steps: [String],
      short_term_goals: [String],
      resources: {
        books: [String],
        online_courses: [String],
        websites: [String],
        organizations: [String]
      }
    },
    government_specific: {
      exam_details: {
        exam_name: String,
        eligibility_criteria: String,
        exam_pattern: String
      },
      training: {
        duration: String,
        location: String
      }
    },
    alternative_paths: [{
      title: String,
      reason: String,
      transition_path: String
    }]
  }],
  type: {
    type: String,
    enum: ['quiz', 'text-based'],
    default: 'quiz'
  },
  inputText: {
    type: String,
    required: function() {
      return this.type === 'text-based';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AssessmentHistory = mongoose.models.AssessmentHistory || 
  mongoose.model('AssessmentHistory', assessmentHistorySchema);

export default AssessmentHistory; 