require('dotenv').config();
const { Feedback } = require('../models/index');

module.exports = {
  //Agree or Disagree with a song classification
  //Note : The annotation or comentary can be null
  async index(req, res) {
    try {
      const { user_id, agreeordisagree, song_id } = req.params;

      //Before creating the feedback we have to see if the user has a feedback already in this song
      const feedback = await Feedback.findOne({
        where: { user_id: user_id, song_id: song_id },
      })
        .then(async (feedback) => {
          //If the user has already a feedback made , we have to update and not create another
          //Now we have to see if his feedback is different than the other he has
          //That means that we have to see if the user has agreed or disagreed on his latest feedback
          if (feedback != null) {
            //if the user has agreed and now is not then
            if (feedback.dataValues.agree == 1 && agreeordisagree == 2) {
              await Feedback.update(
                { disagree: 1, agree: 0 },
                { where: { id: feedback.dataValues.id } },
              );
              return res.status(200).json('U have now disagreed');
            }
            //if the user has not agreed and now is
            else if (
              feedback.dataValues.disagree == 1 &&
              agreeordisagree == 1
            ) {
              await Feedback.update(
                { agree: 1, disagree: 0 },
                { where: { id: feedback.dataValues.id } },
              );
              return res.status(200).json('U have now agreed');
            }
            //if the user has the same opinion
            else if (
              (feedback.dataValues.agree == 1 && agreeordisagree == 1) ||
              (feedback.dataValues.disagree == 1 && agreeordisagree == 2)
            ) {
              return res.status(200).json('The feedback is the same');
            }
          } else {
            //If the user doenst have any feedbacks yet we just have to create
            if (agreeordisagree == 1) {
              await Feedback.create({
                song_id: song_id,
                agree: 1,
                disagree: 0,
                user_id: user_id,
              })
                .then((feedback) => {
                  return res.status(200).json('Feedback created');
                })
                .catch((e) => {
                  console.log(e);
                });
            } else {
              await Feedback.create({
                song_id: song_id,
                agree: 0,
                disagree: 1,
                user_id: user_id,
              })
                .then((feedback) => {
                  return res.status(200).json('Feedback created');
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  },

  //Make an annotation
  async getTotalAgrees(req, res) {
    const { song_id } = req.params;
    try {
      const feedback = await Feedback.findAll({
        where: { agree: 1, song_id: song_id },
      })
        .then(async (feedback) => {
          return res.status(200).json(feedback.length);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  },

  //Make an annotation
  async getTotalDisagrees(req, res) {
    const { song_id } = req.params;
    try {
      const feedback = await Feedback.findAll({
        where: { disagree: 1, song_id: song_id },
      })
        .then(async (feedback) => {
          return res.status(200).json(feedback.length);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  },

  //get if the agree or disagreed with a song classification
  async getUserOpinion(req, res) {
    const { song_id, user_id } = req.params;
    try {
      const feedback = await Feedback.findAll({
        where: { user_id: user_id, song_id: song_id },
      })
        .then((feedback) => {
          return res.status(200).json(feedback);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  },

  async undoFeedback(req, res) {
    const { user_id, song_id } = req.params;
    try {
      const feedback = await Feedback.destroy({
        where: { user_id: user_id, song_id: song_id },
      })
        .then((feedback) => {
          return res.status(200).json('feedback deleted');
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  },
};
