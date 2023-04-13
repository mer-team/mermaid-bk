'use strict';


const duration1 = new Date()
duration1.setMinutes(3)
duration1.setSeconds(32)


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Song', [{
      external_id: "dQw4w9WgXcQ",
      title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      artist: "Rick Astley",
      name: "Never Gonna Give You Up",
      duration: duration1,
      year: new Date().getFullYear(),
      date: new Date(2009, 9, 25),
      genre: "Dance-pop, Blue-eyed soul, Pop, Sazonal, Contemporânea para adultos",
      description: "“Never Gonna Give You Up” was a global smash on its release in July 1987, topping the charts in 25 countries including Rick’s native UK and the US Billboard Hot 100.  It also won the Brit Award for Best single in 1988. Stock Aitken and Waterman wrote and produced the track which was the lead-off single and lead track from Rick’s debut LP “Whenever You Need Somebody”.  The album was itself a UK number one and would go on to sell over 15 million copies worldwide. The legendary video was directed by Simon West – who later went on to make Hollywood blockbusters such as Con Air, Lara Croft – Tomb Raider and The Expendables 2.  The video passed the 1bn YouTube views milestone on 28 July 2021.",
      likes: 0,
      views: 0,
      comments: "",
      hits: DataTypes.INTEGER,
      waveform: DataTypes.STRING,
      status: DataTypes.STRING,
      added_by_ip: DataTypes.STRING
    }]);
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
