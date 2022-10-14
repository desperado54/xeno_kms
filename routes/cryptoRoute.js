import express from 'express';
import {getSigners} from '../security/wallet.js';

const cryptoRouter = express.Router({ mergeParams: true });

cryptoRouter.post('/getSigners', async function(req, res) {
  try {
    const result = await getSigners(req.body.network_id);
    res.send(result);
  } catch(err) {
    res.status(400).send(err.toString());
  }
});

export default cryptoRouter;
