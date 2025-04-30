import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  averageSalary: {
    type: String
  },
  jobDemand: {
    type: String
  },
  skillsRequired: [{
    type: String
  }],
  educationRequirements: {
    type: String
  },
  roadmap: [{
    stepNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: String,
    resources: [{
      type: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      description: String
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
careerSchema.index({ title: 'text', description: 'text' });

const Career = mongoose.models.Career || mongoose.model('Career', careerSchema);

export default Career; 