'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Songs', [
      {
        external_id: 'dQw4w9WgXcQ',
        link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
        artist: 'Rick Astley',
        duration: 487,
        year: new Date().getFullYear(),
        date: new Date(2009, 9, 25),
        genre: 'Dance-pop, Blue-eyed soul, Pop',
        description:
          '“Never Gonna Give You Up” was a global smash on its release in July 1987, topping the charts in 25 countries including Rick’s native UK and the US Billboard Hot 100.  It also won the Brit Award for Best single in 1988. Stock Aitken and Waterman wrote and produced the track which was the lead-off single and lead track from Rick’s debut LP “Whenever You Need Somebody”.  The album was itself a UK number one and would go on to sell over 15 million copies worldwide. The legendary video was directed by Simon West – who later went on to make Hollywood blockbusters such as Con Air, Lara Croft – Tomb Raider and The Expendables 2.  The video passed the 1bn YouTube views milestone on 28 July 2021.',
        hits: 0,
        waveform: 'dQw4w9WgXcQ.png',
        status: 'processed',
        thumbnailHQ: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        thumbnailMQ: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        general_classification: 'Happy',
        added_by_ip: '1.1.1.1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        external_id: 'igFtut_1drQ',
        link: 'https://www.youtube.com/watch?v=igFtut_1drQ',
        title: 'Lil Yachty - sAy sOMETHINg',
        artist: 'lil boat',
        duration: 554,
        year: new Date().getFullYear(),
        date: new Date(2023, 1, 27),
        genre: 'Alternative',
        description:
          'Music video by Lil Yachty performing sAy sOMETHINg. Quality Control Music/Motown Records; © 2023 Quality Control Music, LLC, under exclusive license to UMG Recordings, Inc.',
        hits: 0,
        waveform: 'dQw4w9WgXcQ.png',
        status: 'processed',
        added_by_ip: '1.1.1.1',
        thumbnailHQ: 'https://i.ytimg.com/vi/igFtut_1drQ/hqdefault.jpg',
        thumbnailMQ: 'https://i.ytimg.com/vi/igFtut_1drQ/mqdefault.jpg',
        general_classification: 'Calm',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        external_id: 'TGgcC5xg9YI',
        link: 'https://www.youtube.com/watch?v=TGgcC5xg9YI',
        title: 'SEE YOU AGAIN featuring Kali Uchis',
        artist: 'Tyler, The Creator',
        duration: 997,
        year: new Date().getFullYear(),
        date: new Date(2018, 8, 8),
        genre: 'Pop rap, Pop',
        description:
          "From 'SCUM FUCK FLOWER BOY' 2017* -------- DIR: Tyler Okonma DP:  Luis Panch Perez PRO:Happy Place",
        hits: 0,
        waveform: 'dQw4w9WgXcQ.png',
        status: 'processed',
        added_by_ip: '1.1.1.1',
        thumbnailHQ: 'https://i.ytimg.com/vi/TGgcC5xg9YI/hqdefault.jpg',
        thumbnailMQ: 'https://i.ytimg.com/vi/TGgcC5xg9YI/mqdefault.jpg',
        general_classification: 'Happy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        external_id: 'pRpeEdMmmQ0',
        link: 'https://www.youtube.com/watch?v=pRpeEdMmmQ0',
        title:
          'Shakira - Waka Waka (This Time for Africa) (The Official 2010 FIFA World Cup™ Song)',
        artist: 'Shakira',
        duration: 345,
        year: new Date().getFullYear(),
        date: new Date(2010, 6, 4),
        genre: 'Pop',
        description:
          "Watch the official music video for 'Waka Waka (This Time for Africa) [The Official 2010 FIFA World Cup (TM) Song]' by Shakira Listen to Shakira: https://Shakira.lnk.to/listen_YD",
        hits: 0,
        waveform: 'dQw4w9WgXcQ.png',
        status: 'processed',
        added_by_ip: '1.1.1.1',
        thumbnailHQ: 'https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg',
        thumbnailMQ: 'https://i.ytimg.com/vi/pRpeEdMmmQ0/mqdefault.jpg',
        general_classification: 'Happy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Songs', null, {});
  },
};
