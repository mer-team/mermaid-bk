require('dotenv').config();

const { Feedback } = require('../models/Index');
const { validationResult } = require('express-validator');

// Agree or Disagree with a song classification
//Note : The annotation or comentary can be null
const index = async (req, res) => {
  // Validate feedback data
  const feedbackValidationErrors = validationResult(req);
  if (!feedbackValidationErrors.isEmpty()) {
    return res.status(422).json({ errors: feedbackValidationErrors.array() });
  }

  const { user_id, agreeordisagree, song_id } = req.params;
  try {
    const feedback = await Feedback.findOne({
      where: {
        user_id: user_id,
        song_id: song_id,
      },
    });

    if (feedback != null) {
      if (feedback.dataValues.agree == 1 && agreeordisagree == 2) {
        await Feedback.update({ disagree: 1, agree: 0 }, { where: { id: feedback.dataValues.id } });
        return res.status(200).json('You have now disagreed');
      } else if (feedback.dataValues.disagree == 1 && agreeordisagree == 1) {
        await Feedback.update({ agree: 1, disagree: 0 }, { where: { id: feedback.dataValues.id } });
        return res.status(200).json('You have now agreed');
      } else if (
        (feedback.dataValues.agree == 1 && agreeordisagree == 1) ||
        (feedback.dataValues.disagree == 1 && agreeordisagree == 2)
      ) {
        return res.status(200).json('The feedback is the same');
      }
    } else {
      if (agreeordisagree == 1) {
        await Feedback.create({
          song_id: song_id,
          agree: 1,
          disagree: 0,
          user_id: user_id,
        });
        return res.status(200).json('Feedback created');
      } else {
        await Feedback.create({
          song_id: song_id,
          agree: 0,
          disagree: 1,
          user_id: user_id,
        });
        return res.status(200).json('Feedback created');
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: ['Internal server error'] });
  }
};

// Get total agrees for a song
const getTotalAgrees = async (req, res) => {
  const { song_id } = req.params;
  try {
    const feedback = await Feedback.findAll({
      where: {
        agree: 1,
        song_id: song_id,
      },
    });
    return res.status(200).json(feedback.length);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: ['Internal server error'] });
  }
};

// Get total disagrees for a song
const getTotalDisagrees = async (req, res) => {
  const { song_id } = req.params;
  try {
    const feedback = await Feedback.findAll({
      where: {
        disagree: 1,
        song_id: song_id,
      },
    });
    return res.status(200).json(feedback.length);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: ['Internal server error'] });
  }
};

// Get user's opinion on a song
const getUserOpinion = async (req, res) => {
  const { song_id, user_id } = req.params;
  try {
    const feedback = await Feedback.findAll({
      where: {
        user_id: user_id,
        song_id: song_id,
      },
    });
    return res.status(200).json(feedback);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: ['Internal server error'] });
  }
};

// Undo user's feedback
const undoFeedback = async (req, res) => {
  const { user_id, song_id } = req.params;
  try {
    await Feedback.destroy({
      where: {
        user_id: user_id,
        song_id: song_id,
      },
    });
    return res.status(200).json('Feedback deleted');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: ['Internal server error'] });
  }
};

module.exports = {
  index,
  getTotalAgrees,
  getTotalDisagrees,
  getUserOpinion,
  undoFeedback,
};
