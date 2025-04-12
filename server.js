const express = require('express');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ["https://portfolio-theta-azure-83.vercel.app", "http://localhost:3000"]
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resumeText = fs.readFileSync('resume.txt', 'utf-8');

app.post('/chat', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a person with this resume \n ${resumeText} \n
                    Use it to answer this question \n Question: ${question} \n
                    **Answer must be direct and to the point**\n
                    **If no relevant information is found, give **Ask Relevant Question Only!!** as reply**`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.json({ answer: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: 'Something went wrong. Try again later.' });
  }
});

//for pinging
app.get('/ping', (req, res) => {
    res.status(200).send("✅ Server is running");
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
