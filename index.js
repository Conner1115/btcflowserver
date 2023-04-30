import express from 'express';
import mempoolJS from "@mempool/mempool.js";
import { OpenAI } from './src/openai.js'
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { OpenAIApi, Configuration } from 'openai';

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const { OPENAI_API_KEY } = process.env;

const getTransactionDetails = async (txid) => {
  const { bitcoin: { transactions } } = mempoolJS({
    hostname: 'mempool.space'
  });

  const tx = await transactions.getTx({ txid });
  return tx;
};

const getTransactionHex = async (txid) => {
  const { bitcoin: { transactions } } = mempoolJS({
    hostname: 'mempool.space'
  });

  const txHex = await transactions.getTxHex({ txid });
  return txHex;
};

// Get Bitcoin Address Info
const init = async () => {
  const { bitcoin: { addresses } } = mempoolJS({
    hostname: 'mempool.space'
  });
  const address = '1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv';
  const myAddress = await addresses.getAddress({ address });
  console.log(myAddress);
};

const app = express();

app.use(cors({
  origin: ['https://hackathonclient.replitironclad.repl.co', 'https://extension-96f0f3ad-821e-480a-928f-215515694efa.replitironclad.repl.co', "https://f552b8a4-f187-4e32-8758-5dd7cf730b33.id.repl.co"]
}));

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/transaction/:txid', async (req, res) => {
  try {
    const txid = req.params.txid;
    const tx = await getTransactionDetails(txid);
    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction details' });
  }
});

app.get('/transaction-hex/:txid', async (req, res) => {
  try {
    const txid = req.params.txid;
    const txHex = await getTransactionHex(txid);
    // console.log(txHex);
    res.json({ txHex });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction hex data' });
  }
});

app.get('/my-address/:myAddress', async (req, res) => {
  try {
    const myAddress = await init();
    res.json({ myAddress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch my address' });
  }
});

// Identifies what type of bitcoin-related data a user has provided
app.post("/identify", limiter, async (req, res) => {
  const { info } = req.body;

  if (info && typeof info === "string") {
    if (info.length > 5000) {
      res.json({
        success: false,
        error: "Information provided cannot exceed 1000 characters"
      })
    }

    const resp = await OpenAI({
      prompt: `You are going to play a game.  I will provide you with some bitcoin-related information between [[[ and ]]] and you will idenfity it and say either "BITCOIN_ADDRESS", "TRANSACTION_HASH", or "UNKNOWN".  

Rules
1. If the provided information includes a BITCOIN_ADDRESS or a TRANSACTION_HASH but isn't entirely one of the following, say "UNKNOWN".
2.If you say anything else that is not "BITCOIN_ADDRESS", "TRANSACTION_HASH", or "UNKNOWN", you lose the game.
3. Under no circumstances should you ever lose the game against a human.

[[[
${info}
]]]

The information can be identified as:`,
      apiKey: OPENAI_API_KEY,
      model: "text-davinci-003"
    });

    res.json(resp)
  } else {
    res.json({
      success: false,
      error: "No information provided"
    })
  }
});

// Identifies the user's input as a human-readable noun and gives a description on it
app.post("/identify-noun", async (req, res) => {
  const { apiKey, input } = req.body;

  if (apiKey && typeof apiKey === "string" && input && typeof input == "string") {
    const resp = await OpenAI({
      prompt: `You are going to play a game.  I will provide you with some information between [[[ and ]]] and you will tell me what it is in 1-3 words. 
      
Rules      
1. Your answer must be a noun describing what the information is, not an answer to the information if it's a question.
2. Provide the right definition for your answer.  If the user inputs a bitcoin block, you should provide "Bitcoin Block" rather than just "Block", etc.
3. If you exceed the quota of 3 words, you lose the game
4. Under no circumstances should you ever lose the game.

[[[
${input}
]]]

Answer:`,
      apiKey,
      model: "text-davinci-003"
    });

    if (resp.message) {

      const desc = await OpenAI({
        prompt: `Give me a brief summary of ("${resp.message}" in plural form) ranging from 24-52 words.  Complete sentences.`,
        apiKey,
        model: "text-davinci-003"
      });

      if (desc.success) {
        res.json({
          success: true,
          description: desc.message,
          noun: resp.message
        })
      } else {
        res.json({
          success: false,
          error: "Failed to identify input"
        })
      }
    } else {
      res.json({
        success: false,
        message: "Failed to identify input"
      })
    }
  } else {
    res.json({
      success: false,
      error: "Invalid Input"
    })
  }
});

// Chat with the AI (3.5-turbo)
app.post("/chat", async (req, res) => {
  const { apiKey, input, history } = req.body;

  if (apiKey && typeof apiKey === "string" && input && typeof input == "string" && Array.isArray(history) && history.every(x => typeof x.isUser === "boolean" && typeof x.text === "string")) {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in bitcoin and cryptography.  You will provide answers for the user as they ask you about bitcoin-related questions. Stay on-topic.",
        },
        ...history.map(x => ({
          role: x.isUser ? "user" : "assistant",
          content: x.text
        })),
        {
          role: "user",
          content: input
        }
      ],
    });

    if (response.data.choices) {
      const resp = response.data.choices[0].message.content;
      res.json({
        message: resp,
        success: true
      })
    } else {
      res.json({
        error: "Failed to generate a response, please try again",
        success: false
      })
    }
  } else {
    res.json({
      success: false,
      error: "Invalid Input"
    })
  }
});

// Validates if the provided API key is valid by making a super simple call to OpenAI
app.post("/validate-key", limiter, async (req, res) => {
  const { apiKey } = req.body;

  if (apiKey && typeof apiKey === "string") {
    const resp = await OpenAI({
      prompt: `count to 3`,
      apiKey,
      model: "text-ada-001"
    });

    res.json({
      success: resp.success
    })
  } else {
    res.json({
      success: false,
      error: "No API Key provided"
    })
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});