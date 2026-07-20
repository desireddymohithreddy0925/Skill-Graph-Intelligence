const User = require('../models/User');

/**
 * Updates a user's streak based on their last activity.
 * Call this whenever a user does a qualifying daily activity.
 */
const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const now = new Date();
    const lastActivity = user.lastActivityDate;

    // Normalize to midnight UTC for absolute 24-hour day boundaries
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    let updatedUser;

    if (!lastActivity) {
      updatedUser = await User.findOneAndUpdate(
        { _id: userId, lastActivityDate: null },
        { 
          $set: { streak: 1, lastActivityDate: now },
          $addToSet: { activityHistory: today }
        },
        { new: true }
      );
    } else {
      const lastDay = new Date(Date.UTC(lastActivity.getUTCFullYear(), lastActivity.getUTCMonth(), lastActivity.getUTCDate()));
      const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return { streak: user.streak, message: 'Streak already maintained today.' };
      } else if (diffDays === 1) {
        updatedUser = await User.findOneAndUpdate(
          { _id: userId, lastActivityDate: user.lastActivityDate },
          { 
            $inc: { streak: 1 }, 
            $set: { lastActivityDate: now }, 
            $addToSet: { activityHistory: today } 
          },
          { new: true }
        );
      } else {
        updatedUser = await User.findOneAndUpdate(
          { _id: userId, lastActivityDate: user.lastActivityDate },
          { 
            $set: { streak: 1, lastActivityDate: now }, 
            $addToSet: { activityHistory: today } 
          },
          { new: true }
        );
      }
    }

    // If updatedUser is null, it means a concurrent request already updated it.
    if (!updatedUser) {
      return { streak: user.streak, message: 'Streak already updated concurrently.' };
    }

    return { streak: updatedUser.streak, message: 'Streak updated!' };
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

/**
 * Lazy evaluation of the current streak.
 * Checks if midnight has passed and automatically consumes freezes without advancing the streak.
 * Should be called whenever fetching user dashboard data.
 */
const evaluateCurrentStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.lastActivityDate) return null;

    const now = new Date();
    const lastActivity = user.lastActivityDate;

    // Normalize to absolute midnight UTC boundaries
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const lastDay = new Date(Date.UTC(lastActivity.getUTCFullYear(), lastActivity.getUTCMonth(), lastActivity.getUTCDate()));
    
    const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      await User.findByIdAndUpdate(userId, { $set: { streak: 0 } });
      user.streak = 0;
    }
    
    return { streak: user.streak };
  } catch (err) {
    console.error('Error evaluating streak:', err);
  }
};

module.exports = { updateStreak, evaluateCurrentStreak };
