const { version } = require('../../package.json');
const config = require('../config/core/config');

const swaggerDef = {
   openapi: '3.0.0',
  info: {
    title: 'Himaya Aegis Api',
     version
    
  },
  tags: [
   
    {
      name: 'Business Unit',
      description: 'Endpoints related to Business Unit management',
    },
    {
      name: 'User Profile',
      description: 'Endpoints related to User Profile settings',
    },
  ],
  servers: [
    {
      url: `http://localhost:${config.port}`,
    },
  ],

  
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

module.exports = swaggerDef;
