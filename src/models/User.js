import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// If User model already exists, use it
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  methods: {
    // Method to compare password
    comparePassword: async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }
}));

// Hash password before saving
if (!mongoose.models.User) {
  User.schema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
}

export default User; 