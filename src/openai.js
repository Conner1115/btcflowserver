import { OpenAIApi, Configuration } from 'openai';

export const OpenAI = async ({
  model,
  prompt,
  apiKey,
  maxTokens
}) => {
  try {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model,
      prompt,
      temperature: 0,
      max_tokens: maxTokens || 256,
    });

    if (response.data.choices) {
      const resp = response.data.choices[0].text;
      return ({
        success: true,
        message: resp.trim(),
      });
    } else {
      return ({
        success: false,
        error: "Failed to generate a response, please try again",
      });
    }
  } catch (e) {
    return {
      error: e.message,
      success: false
    }
  }
}