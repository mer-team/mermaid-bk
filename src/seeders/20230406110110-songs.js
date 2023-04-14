'use strict';


const duration1 = new Date()
duration1.setMinutes(3)
duration1.setSeconds(32)

const duration2 = new Date()
duration2.setMinutes(5)
duration2.setSeconds(36)

const duration3 = new Date()
duration3.setMinutes(3)
duration3.setSeconds(22)

const duration4 = new Date()
duration4.setMinutes(3)
duration4.setSeconds(30)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Songs', [
      {
        external_id: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t",
        title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
        artist: "Rick Astley",
        duration: duration1,
        year: new Date().getFullYear(),
        date: new Date(2009, 9, 25),
        genre: "Dance-pop, Blue-eyed soul, Pop",
        description: "“Never Gonna Give You Up” was a global smash on its release in July 1987, topping the charts in 25 countries including Rick’s native UK and the US Billboard Hot 100.  It also won the Brit Award for Best single in 1988. Stock Aitken and Waterman wrote and produced the track which was the lead-off single and lead track from Rick’s debut LP “Whenever You Need Somebody”.  The album was itself a UK number one and would go on to sell over 15 million copies worldwide. The legendary video was directed by Simon West – who later went on to make Hollywood blockbusters such as Con Air, Lara Croft – Tomb Raider and The Expendables 2.  The video passed the 1bn YouTube views milestone on 28 July 2021.",
        hits: 0,
        waveform: "dQw4w9WgXcQ.png",
        status: "processed",
        added_by_ip: "1.1.1.1",
        general_classification: "Happy",
        createdAt: new Date(),
        updatedAt: new Date()
    }, 

    {
      external_id: "https://www.youtube.com/watch?v=igFtut_1drQ",
      title: "Lil Yachty - sAy sOMETHINg",
      artist: "lil boat",
      duration: duration2,
      year: new Date().getFullYear(),
      date: new Date(2023, 1, 27),
      genre: "Alternative",
      description: "Music video by Lil Yachty performing sAy sOMETHINg. Quality Control Music/Motown Records; © 2023 Quality Control Music, LLC, under exclusive license to UMG Recordings, Inc.",
      hits: 0,
      waveform: "dQw4w9WgXcQ.png",
      status: "processed",
      added_by_ip: "1.1.1.1", 
      general_classification: "Calm",
      createdAt: new Date(),
      updatedAt: new Date()
    }, 

    {
      external_id: "https://www.youtube.com/watch?v=TGgcC5xg9YI",
      title: "SEE YOU AGAIN featuring Kali Uchis",
      artist: "Tyler, The Creator",
      duration: duration3,
      year: new Date().getFullYear(),
      date: new Date(2018, 8, 8),
      genre: "Pop rap, Pop",
      description: "From 'SCUM FUCK FLOWER BOY' 2017* -------- DIR: Tyler Okonma DP:  Luis Panch Perez PRO:Happy Place",
      hits: 0,
      waveform: "dQw4w9WgXcQ.png",
      status: "processed",
      added_by_ip: "1.1.1.1", 
      general_classification: "Happy",
      createdAt: new Date(),
      updatedAt: new Date()
    }, 

    {
      external_id: "https://www.youtube.com/watch?v=pRpeEdMmmQ0",
      title: "Shakira - Waka Waka (This Time for Africa) (The Official 2010 FIFA World Cup™ Song)",
      artist: "Shakira",
      duration: duration4,
      year: new Date().getFullYear(),
      date: new Date(2010, 6, 4),
      genre: "Pop",
      description: "Watch the official music video for 'Waka Waka (This Time for Africa) [The Official 2010 FIFA World Cup (TM) Song]' by Shakira Listen to Shakira: https://Shakira.lnk.to/listen_YD",
      hits: 0,
      waveform: "dQw4w9WgXcQ.png",
      status: "processed",
      added_by_ip: "1.1.1.1", 
      general_classification: "Happy",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Songs', null, {});
  }
};
