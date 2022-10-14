import express from 'express';
import logger from 'morgan';
import http from 'http';
import cors from 'cors';

import cryptoRoute from './routes/cryptoRoute.js';

// import swaggerUI from 'swagger-ui-express';
// //import swaggerJSDocs from 'swagger-jsdoc';

// import swaggerJSDocs from './swagger.json' assert {type: "json"};

// const definition = {
//   info: {
//     title: 'XENO web3 api',
//     description: 'web api specification for xeno blockchain project.' ,
//     version: '3.0.0', 
//   },
//   servers: ["http://localhost:3000"]
// };

// const options = {
//   definition,
//   apis: ['./routes/tokenRoute.js'],
// };

//const swaggerSpec = swaggerJSDocs(options);

const app = express();

//app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));
app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use('/crypto', cryptoRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next("invalid url");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = 3300;
//start http server
const server = http.createServer(app);
server.listen(port);
server.setTimeout(300000);
//console.log(`[${serviceName}] http server listening at port ${port}`);

export default app;
