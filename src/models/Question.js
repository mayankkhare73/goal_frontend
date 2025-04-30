import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Learning Style',
      'Problem Solving',
      'Work Environment',
      'Task Preferences',
      'Subject Interests',
      'Social Interaction',
      'Career Values',
      'Technical Skills',
      'Soft Skills',
      'Work-Life Balance',
      'Salary Expectations',
      'Location Preferences',
      'Leadership Style',
      'Risk Tolerance',
      'Innovation Interest',
      'Business Acumen',
      'Service Orientation',
      'Creativity Level',
      'Stress Management',
      'Decision Making'
    ]
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      default: 1
    }
  }],
  allowsMultiple: {
    type: Boolean,
    default: false
  },
  maxSelections: {
    type: Number,
    default: 1
  },
  isRequired: {
    type: Boolean,
    default: true
  }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

export default Question; 