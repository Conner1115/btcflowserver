import express from 'express';
import mempoolJS from "@mempool/mempool.js";

const init = async () => {

  const { bitcoin: { difficulty } } = mempoolJS({
    hostname: 'mempool.space'
  });

  const difficultyAdjustment = await difficulty.getDifficultyAdjustment();
  console.log(difficultyAdjustment);

};

// const init = async () => {
  
//   const { bitcoin: { transactions } } = mempoolJS({
//     hostname: 'mempool.space'
//   });

//   const txid = '15e10745f15593a899cef391191bdd3d7c12412cc4696b7bcb669d0feadc8521';
//   const tx = await transactions.getTx({ txid });
//   console.log(tx);
          
// };

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/difficulty-adjustment', async (req, res) => {
  try {
    const difficultyAdjustment = await init();
    res.json({ difficultyAdjustment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch difficulty adjustment' });
  }
});

// app.get('/get-transaction', async (req, res) => {
//   try {
//     const getTransaction = await init();
//     res.json({ getTransaction });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch get transaction' });
//   }
// });

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');

});